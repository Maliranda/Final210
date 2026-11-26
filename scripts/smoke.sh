#!/bin/bash
# Exercise the three operations against a running API.
set -euo pipefail

BASE="${1:-http://127.0.0.1:8088}"

echo "GET /health"
curl -sfS "$BASE/health"
echo
echo "POST /api/words"
CREATED="$(curl -sfS -X POST "$BASE/api/words" \
  -H 'content-type: application/json' \
  -d '{"term":"ephemeral","definition":"lasting for a short time"}')"
echo "$CREATED"
ID="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["word"]["id"])' "$CREATED")"
echo "PATCH /api/words/${ID}"
curl -sfS -X PATCH "$BASE/api/words/${ID}" \
  -H 'content-type: application/json' \
  -d '{"masteryLevel":2}'
echo
echo "GET /api/words"
curl -sfS "$BASE/api/words"
echo
