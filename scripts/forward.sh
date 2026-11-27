#!/bin/bash
# Publish the Service on the laptop. Minikube's docker driver cannot map the
# same host port onto every node, so this forwards to the Service, not to one pod.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export KUBECONFIG="${KUBECONFIG:-$ROOT/terraform/kubeconfig}"
PORT="${HOST_PORT:-30080}"

echo "Service is on http://127.0.0.1:${PORT}/health"
exec kubectl -n vocabulary port-forward "svc/vocabulary-api" "${PORT}:80"
