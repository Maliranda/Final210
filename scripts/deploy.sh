#!/bin/bash
# Build the API image, load it into the minikube cluster, and apply the manifests.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export KUBECONFIG="${KUBECONFIG:-$ROOT/terraform/kubeconfig}"

if [[ ! -f "$KUBECONFIG" ]]; then
  echo "No kubeconfig at $KUBECONFIG. From terraform/, run: terraform apply" >&2
  exit 1
fi

mkdir -p "$ROOT/.secrets"
if [[ ! -s "$ROOT/.secrets/db-password" ]]; then
  openssl rand -hex 16 > "$ROOT/.secrets/db-password"
  chmod 600 "$ROOT/.secrets/db-password"
fi
PASSWORD="$(tr -d '[:space:]' < "$ROOT/.secrets/db-password")"

echo "Building vocabulary-api:local"
docker build --provenance=false --sbom=false -t vocabulary-api:local "$ROOT/api"

CLUSTER="${CLUSTER_NAME:-vocabulary}"
echo "Loading image into minikube profile ${CLUSTER}"
minikube image load vocabulary-api:local --profile "$CLUSTER"

if ! kubectl get nodes -l vocabulary-role=database --no-headers 2>/dev/null | grep -q .; then
  FIRST="$(kubectl get nodes -l '!node-role.kubernetes.io/control-plane' -o jsonpath='{.items[0].metadata.name}')"
  echo "Labelling ${FIRST} as the database node"
  kubectl label node "$FIRST" vocabulary-role=database --overwrite
fi

kubectl apply -f "$ROOT/k8s/namespace.yaml"
kubectl -n vocabulary create secret generic vocabulary-db \
  --from-literal=PGPASSWORD="$PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f "$ROOT/k8s/configmap.yaml"
kubectl apply -f "$ROOT/k8s/postgres.yaml"
kubectl apply -f "$ROOT/k8s/api.yaml"
kubectl apply -f "$ROOT/k8s/pdb.yaml"

kubectl -n vocabulary rollout status deploy/postgres --timeout=180s
kubectl -n vocabulary rollout status deploy/vocabulary-api --timeout=180s
kubectl -n vocabulary get pods -o wide
echo "API: http://127.0.0.1:${HOST_PORT:-30080}/health"
