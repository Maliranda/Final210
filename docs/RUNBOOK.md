# Runbook

The cluster is local minikube, profile `vocabulary`. `KUBECONFIG` is `terraform/kubeconfig` after `terraform apply`. Commands below assume the repository root unless they say otherwise.

## Deploy

```bash
cd terraform
terraform init
terraform apply
cd ..
./scripts/deploy.sh
```

In a second terminal, leave this running, then smoke-test from the first:

```bash
./scripts/forward.sh
./scripts/smoke.sh http://127.0.0.1:30080
```

`scripts/forward.sh` is `kubectl port-forward` to the Service. Minikube with the Docker driver cannot publish port 30080 on every node, because the laptop only has that port once. The forward targets the Service, so traffic keeps moving when one pod disappears.

`scripts/deploy.sh` builds `vocabulary-api:local`, loads that image with `minikube image load`, creates the Secret from `.secrets/db-password` (it generates the file the first time), and applies `k8s/`. The password file is gitignored. `k8s/secret.example.yaml` only shows the shape of the Secret. Do not apply it over the generated one.

A second `./scripts/deploy.sh` rebuilds the image and re-applies the manifests. A second `terraform apply`, with no edits, should report no changes.

Logs from a running API container:

```bash
kubectl --kubeconfig terraform/kubeconfig -n vocabulary logs deploy/vocabulary-api --tail=50
```

Health:

```bash
curl -sS http://127.0.0.1:30080/health
```

Compose, when you are not using the cluster:

```bash
docker compose up --build
docker compose logs api
curl -sS http://127.0.0.1:8088/health
```

## Roll back

The Deployment keeps rollout history.

```bash
export KUBECONFIG=terraform/kubeconfig
kubectl -n vocabulary rollout history deployment/vocabulary-api
kubectl -n vocabulary rollout undo deployment/vocabulary-api
kubectl -n vocabulary rollout status deployment/vocabulary-api
```

Undo returns the pod template to the previous revision, including the previous `APP_VERSION`. `GET /health` includes that version, so you can see which revision is answering.

To watch a rollout and an undo while requests are in flight:

```bash
./scripts/rollout-demo.sh
```

## When it stops working

Check these three, in this order.

1. Are the pods Ready? `kubectl --kubeconfig terraform/kubeconfig -n vocabulary get pods -o wide`. If an API pod is `ImagePullBackOff`, the node does not have `vocabulary-api:local`. Run `./scripts/deploy.sh` again. If a pod is `OOMKilled`, the memory limit was too low for Node. If Postgres is `Pending`, the database node label is missing. The deploy script labels a worker `vocabulary-role=database` when Terraform did not.

2. Does the health check reach the database? `curl -sS -D- http://127.0.0.1:30080/health`. A 503 means the process is up and Postgres is not answering. Then read `kubectl -n vocabulary logs deploy/postgres --tail=50` and `kubectl -n vocabulary describe pod -l app=postgres`. A connection refused in the API logs means the Service `postgres` has no ready endpoints.

3. Is a node still cordoned from a failover drill? `kubectl get nodes`. `SchedulingDisabled` means a drain was not followed by uncordon. `kubectl uncordon <node>` puts it back. If both API pods are on one node after that, delete one API pod and the scheduler will place the replacement.

The PodDisruptionBudget keeps drain from evicting the last API pod. It will not save you if the node you drain is the one running Postgres. That node is a single point of failure. Drain the other worker.

## Failover drill

```bash
./scripts/failover-demo.sh
```

The script asks the Service for `/health` from inside the Postgres pod, and drains the worker that is not running Postgres and is not the control-plane. It uncordons that node when it finishes. The request log is written to `docs/evidence/`. The probe is inside the cluster because `kubectl port-forward` is tied to one pod and dies when that pod is evicted.

## Tear down

```bash
docker compose down -v
cd terraform
terraform destroy
```

Destroy runs `minikube delete` for the `vocabulary` profile, including the Postgres volume that lived on the node. Copy any words you need before you do that. Nothing in AWS is created by this project, so there is no cloud bill to shut off. Do not leave the minikube profile running overnight if you are done. It holds three Docker containers.

## Cost if this ran all month

On the laptop the marginal cost is electricity for three minikube nodes, well under a dollar, because the machine is already on. Moving the same shape to AWS and leaving it up would be a different bill. An EKS control plane is about $73 a month. Two small workers (t3.small) are about $30. An application load balancer is about $20 before traffic. A db.t4g.micro for Postgres is about $15. Roughly $140 a month, almost all of it the control plane and the load balancer, for an API that sits idle between study sessions. The first change would be to drop the managed control plane and run the two containers on one small VM, or to shut the cluster down outside the hours someone is actually studying. Prices move. These are late-2026 ballpark figures, not a quote.
