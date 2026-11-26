#!/bin/bash
# Drain the worker that is not hosting Postgres, while probing the Service.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export KUBECONFIG="${KUBECONFIG:-$ROOT/terraform/kubeconfig}"
URL="${1:-http://127.0.0.1:30080/health}"
EVIDENCE="$ROOT/docs/evidence"
mkdir -p "$EVIDENCE"
LOG="$EVIDENCE/failover-requests.log"
DURATION="${DURATION:-90}"

python3 - "$URL" "$LOG" "$DURATION" <<'PY' &
import sys, time, urllib.request
url, out, duration = sys.argv[1], sys.argv[2], float(sys.argv[3])
end = time.time() + duration
with open(out, "w", encoding="utf-8") as fh:
    while time.time() < end:
        started = time.time()
        code = "ERR"
        detail = ""
        try:
            with urllib.request.urlopen(url, timeout=2) as res:
                code = str(res.status)
                detail = res.read(160).decode("utf-8", "replace").replace("\n", " ")
        except Exception as exc:
            detail = type(exc).__name__
        fh.write(f"{started:.3f} {code} {detail}\n")
        fh.flush()
        time.sleep(0.25)
PY
PROBE=$!

sleep 5
kubectl -n vocabulary get pods -o wide | tee "$EVIDENCE/pods-before-drain.txt"

DB_NODE="$(kubectl get pod -n vocabulary -l app=postgres -o jsonpath='{.items[0].spec.nodeName}')"
APP_NODE="$(kubectl get pod -n vocabulary -l app=vocabulary-api -o jsonpath='{range .items[*]}{.spec.nodeName}{"\n"}{end}' | grep -v "^${DB_NODE}$" | head -1 || true)"

{
  echo "database node: ${DB_NODE}"
  echo "draining node: ${APP_NODE:-none}"
} | tee "$EVIDENCE/drain-target.txt"

if [[ -n "${APP_NODE:-}" ]]; then
  kubectl drain "$APP_NODE" --ignore-daemonsets --delete-emptydir-data --force --grace-period=10 --timeout=120s \
    | tee "$EVIDENCE/drain.txt"
else
  echo "No API pod was on a different node from Postgres. Deleting one API pod instead." | tee "$EVIDENCE/drain.txt"
  POD="$(kubectl get pod -n vocabulary -l app=vocabulary-api -o jsonpath='{.items[0].metadata.name}')"
  kubectl -n vocabulary delete pod "$POD" --wait=false | tee -a "$EVIDENCE/drain.txt"
fi

wait "$PROBE" || true

if [[ -n "${APP_NODE:-}" ]]; then
  kubectl uncordon "$APP_NODE" | tee "$EVIDENCE/uncordon.txt"
fi

kubectl -n vocabulary rollout status deploy/vocabulary-api --timeout=180s
kubectl -n vocabulary get pods -o wide | tee "$EVIDENCE/pods-after-drain.txt"

python3 - "$LOG" <<'PY' | tee "$EVIDENCE/failover-summary.txt"
import sys
rows = []
for line in open(sys.argv[1], encoding="utf-8"):
    parts = line.split(None, 2)
    if len(parts) < 2:
        continue
    rows.append((float(parts[0]), parts[1]))
if not rows:
    print("no samples")
    raise SystemExit(1)
bad = [row for row in rows if row[1] != "200"]
print(f"samples {len(rows)}")
print(f"ok {len(rows) - len(bad)}")
print(f"failed {len(bad)}")
longest = 0.0
fail_start = None
last_ok = rows[0][0]
for ts, code in rows:
    if code == "200":
        if fail_start is not None:
            longest = max(longest, ts - fail_start)
            fail_start = None
        last_ok = ts
    elif fail_start is None:
        fail_start = last_ok
if fail_start is not None:
    longest = max(longest, rows[-1][0] - fail_start)
print(f"longest gap seconds {longest:.3f}")
print(f"window seconds {rows[-1][0] - rows[0][0]:.3f}")
if bad:
    print("failed lines:")
    for line in open(sys.argv[1], encoding="utf-8"):
        parts = line.split()
        if len(parts) > 1 and parts[1] != "200":
            print(line.rstrip())
PY
