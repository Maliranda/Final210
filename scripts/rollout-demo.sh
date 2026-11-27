#!/bin/bash
# Roll the API forward and back while the Service is being probed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export KUBECONFIG="${KUBECONFIG:-$ROOT/terraform/kubeconfig}"
EVIDENCE="$ROOT/docs/evidence"
mkdir -p "$EVIDENCE"
LOG="$EVIDENCE/rollout-requests.log"
DURATION="${DURATION:-150}"

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
    print("first failed sample:", bad[0][0], bad[0][1])
PY
