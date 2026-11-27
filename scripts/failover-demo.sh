#!/bin/bash
# Drain the worker that is not hosting Postgres, while probing the Service.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export KUBECONFIG="${KUBECONFIG:-$ROOT/terraform/kubeconfig}"
EVIDENCE="$ROOT/docs/evidence"
mkdir -p "$EVIDENCE"
LOG="$EVIDENCE/failover-requests.log"
DURATION="${DURATION:-90}"

# Probe from the Postgres pod. kubectl port-forward sticks to one API pod and
# dies with it, which would look like an outage that the Service did not have.
kubectl -n vocabulary exec deploy/postgres -- sh -c "
end=\$((\$(date +%s) + ${DURATION}))
while [ \$(date +%s) -lt \$end ]; do
  ts=\$(date +%s)
  if body=\$(wget -qO- --timeout=2 http://vocabulary-api.vocabulary.svc/health); then
    echo \"\$ts 200 \$body\"
  else
    echo \"\$ts ERR\"
  fi
  sleep 0.25
done
" > "$LOG" &
PROBE=$!

sleep 5
kubectl -n vocabulary get pods -o wide | tee "$EVIDENCE/pods-before-drain.txt"

DB_NODE="$(kubectl get pod -n vocabulary -l app=postgres -o jsonpath='{.items[0].spec.nodeName}')"
CP_NODE="$(kubectl get nodes -l node-role.kubernetes.io/control-plane -o jsonpath='{.items[0].metadata.name}')"
APP_NODE="$(kubectl get pod -n vocabulary -l app=vocabulary-api -o jsonpath='{range .items[*]}{.spec.nodeName}{"\n"}{end}' | grep -v "^${DB_NODE}$" | grep -v "^${CP_NODE}$" | head -1 || true)"

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
    print("first failed line:", " ".join(str(part) for part in [bad[0][0], bad[0][1]]))
PY
