#!/bin/bash
# Roll the API forward and back while the Service is being probed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export KUBECONFIG="${KUBECONFIG:-$ROOT/terraform/kubeconfig}"
URL="${1:-http://127.0.0.1:30080/health}"
EVIDENCE="$ROOT/docs/evidence"
mkdir -p "$EVIDENCE"
LOG="$EVIDENCE/rollout-requests.log"
DURATION="${DURATION:-150}"

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

sleep 4
{
  echo "rollout start $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  kubectl -n vocabulary set env deployment/vocabulary-api APP_VERSION=2
  kubectl -n vocabulary rollout status deployment/vocabulary-api --timeout=180s
  echo "forward done $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  kubectl -n vocabulary rollout undo deployment/vocabulary-api
  kubectl -n vocabulary rollout status deployment/vocabulary-api --timeout=180s
  echo "rollback done $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  kubectl -n vocabulary rollout history deployment/vocabulary-api
} | tee "$EVIDENCE/rollout.txt"

wait "$PROBE" || true

python3 - "$LOG" <<'PY' | tee "$EVIDENCE/rollout-summary.txt"
import sys
rows = []
versions = []
for line in open(sys.argv[1], encoding="utf-8"):
    parts = line.split(None, 2)
    if len(parts) < 2:
        continue
    rows.append((float(parts[0]), parts[1], parts[2] if len(parts) > 2 else ""))
    if '"version":"2"' in (parts[2] if len(parts) > 2 else "") or '"version": "2"' in (parts[2] if len(parts) > 2 else ""):
        versions.append("2")
    elif '"version":"1"' in (parts[2] if len(parts) > 2 else "") or '"version": "1"' in (parts[2] if len(parts) > 2 else ""):
        versions.append("1")
bad = [row for row in rows if row[1] != "200"]
print(f"samples {len(rows)}")
print(f"ok {len(rows) - len(bad)}")
print(f"failed {len(bad)}")
print(f"saw version 1: {versions.count('1')}")
print(f"saw version 2: {versions.count('2')}")
longest = 0.0
fail_start = None
last_ok = rows[0][0] if rows else 0
for ts, code, _detail in rows:
    if code == "200":
        if fail_start is not None:
            longest = max(longest, ts - fail_start)
            fail_start = None
        last_ok = ts
    elif fail_start is None:
        fail_start = last_ok
if rows and fail_start is not None:
    longest = max(longest, rows[-1][0] - fail_start)
print(f"longest gap seconds {longest:.3f}")
if bad:
    print("failed lines:")
    for ts, code, detail in bad:
        print(f"{ts:.3f} {code} {detail}")
PY
