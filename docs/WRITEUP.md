# Write-up

The product is Vocabulary Builder. The React app already in this repository is from my web-programming projects (Projects 3–5). This course trims that product to a word API and one Postgres table, and puts a pipeline, a kind cluster, and a Kubernetes deployment under it. I am on the local track: one control-plane and two workers, created with Terraform. I did not use AWS. The availability demo is a node drain, which is the same claim a load balancer and two availability zones would be making, without a bill.

Evidence from the machine is filled in after the commands below. Pipeline links are added once GitHub has run them.

## Container image

The runtime image is Alpine 3.24 with the `node` binary copied out of `node:22-alpine`. I did not run the official Node image as the final stage. On this machine that image is 241MB, because it also contains npm, yarn, and headers. The server only needs the binary, `libstdc++`, the production `node_modules`, and `src`. I did not use a distroless image. The rolling update runs `sleep` in a `preStop` hook, and I want a shell available when a pod is misbehaving.

The Dockerfile is multi-stage. `npm ci` runs in the first stage and the npm cache stays there. `.dockerignore` drops tests, markdown, and any local `node_modules`. DevDependencies (eslint, supertest) are not installed. The process runs as uid 1000, a user created in the image. The Kubernetes pod also sets `runAsNonRoot`, a read-only root filesystem, and a writable emptyDir on `/tmp`.

Configuration is environment variables. The image does not contain a database password or a host name.

Image size, from `docker image ls` on this machine: **199MB**. The official `node:22-alpine` tag, which is the image I copied the binary from, is 234MB. The difference is npm, yarn, and the headers, which the running server does not use. The application layer on top of the Node binary is about 6MB (`node_modules` plus `src`).

## Pipeline

`.github/workflows/ci.yml` runs on every push and every pull request. The jobs are `lint`, then `test` (`needs: lint`), then `image` (`needs: test`). Node dependencies are cached with `actions/setup-node`. The image build uses the GitHub Actions cache. Tests write `api/test-results/junit.xml` and the workflow uploads that file with `if: always()`, so a failed run still keeps the report.

The image is pushed to `ghcr.io/maliranda/final210` only when the event is a push to `main`. Pull requests build it and do not push it.

Red run, and the green run that fixed it.

The red run is the pull request run on the commit that let a blank term through: [run 45778722974](https://github.com/Maliranda/Final210/actions/runs/45778722974). Lint passed. The test `rejects an empty term before it is stored` failed. The image job was skipped, which is what `needs: test` is there for. The push of that same commit failed the same way: [run 45778708784](https://github.com/Maliranda/Final210/actions/runs/45778708784).

The fix is [run 45778837418](https://github.com/Maliranda/Final210/actions/runs/45778837418). Lint, test, and image all succeeded. The push of that commit is [run 45778831740](https://github.com/Maliranda/Final210/actions/runs/45778831740), also green.

The green run on `main`, which is the one that logs into GHCR and pushes `ghcr.io/maliranda/final210`, is [run 45779224728](https://github.com/Maliranda/Final210/actions/runs/45779224728). The image job logged in and the build-and-push step succeeded.

## Infrastructure as Code

`terraform/` is the cluster. The kind provider builds one control-plane and two workers. The control-plane publishes `127.0.0.1:30080` to NodePort 30080. One worker is labelled `vocabulary-role=database`. The provider cannot edit a live cluster, so a change of shape replaces it. That is the right behaviour for kind: you do not resize these nodes in place.

The workloads are Kubernetes manifests in `k8s/`. I kept them as manifests so `kubectl rollout` and `kubectl drain` are the tools in the demo, which is what step 7 asks me to show. Terraform owns the cluster. The manifests own everything inside it. Nothing was clicked together in a console.

A second plan, after apply, exited 0. From `docs/evidence/terraform-plan.txt`:

```
No changes. Your infrastructure matches the configuration.

Terraform has compared your real infrastructure against your configuration
and found no differences, so no changes are needed.
```

A second `kubectl apply` of the manifests reported `unchanged` for the namespace, ConfigMap, volume, Services, and Deployments. The PodDisruptionBudget line said `configured`. That is kubectl filling a default field, not a second copy of the object. Output is in `docs/evidence/kubectl-apply-again.txt`.

Teardown, from `docs/evidence/terraform-destroy.txt`:

```
Plan: 0 to add, 0 to change, 1 to destroy.
kind_cluster.vocabulary: Destruction complete after 5s
Destroy complete! Resources: 1 destroyed.
```

`docker compose down -v` removed the compose containers as well. `docker ps` showed no vocabulary containers afterwards (`docs/evidence/compose-down.txt`). The destroy plan also printed the cluster's client certificate. I did not save that into the evidence file. The cluster is gone, so the key is gone with it.

Kubeconfig and state are gitignored. There are no cloud credentials in the Terraform.

## High availability

Two API replicas, preferred on different nodes. Readiness is `GET /health/ready`, which runs `SELECT 1`. A pod that cannot see Postgres is removed from the Service. Liveness is `GET /health/live`, which does not touch the database. If the database blips and both pods fail readiness, restarting them would not help, and a liveness check that depended on Postgres would restart every replica at once. The startup probe gives Postgres up to a minute before liveness matters.

The PodDisruptionBudget says at least one API pod must stay. The failover script drains the worker that is not running Postgres.

Failover, captured in `docs/evidence/`. Postgres stayed on `vocabulary-worker`. The script drained `vocabulary-worker2`, which held one API pod. Over 89.8 seconds and 340 probes of `GET /health`, every probe returned 200. The longest gap was 0 seconds at a probe interval of 0.25s, so any interruption was shorter than that interval. After the drain the replacement pod was scheduled onto the database node, because the other node was still cordoned. Uncordon does not move it back. That is expected, and the Service was answering the whole time.

```
samples 340
ok 340
failed 0
longest gap seconds 0.000
window seconds 89.751
```

### What is still a single point of failure

- Postgres is one pod on one worker, and the volume is a hostPath on that node. Draining the database node, or deleting it, takes the word list with it. The API pods then fail readiness and the Service stops answering. Two API replicas do not fix a dead database.
- The control-plane is one node, and the only published port is mapped there. If that node dies, the workers can be healthy and the laptop still cannot reach the Service.
- The whole cluster is one Docker daemon on one laptop. There is no second machine.
- There is no backup of the volume. `terraform destroy` deletes the words.
- The database password is one generated value in `.secrets/db-password` and a Kubernetes Secret. There is no rotation and no second copy.

The compose file's password `vocabulary` is a local default so `docker compose up` is one command. It is not the cluster password, and it is not used for anything outside that compose project.

## Kubernetes

| Choice | Why |
| --- | --- |
| 2 replicas | One replica cannot survive a drain. A third replica does not change the demo and makes the small kind nodes tighter. |
| `maxUnavailable: 0`, `maxSurge: 1` | A new pod has to be ready before an old one is removed, so a rollout keeps one pod in the Service. |
| `preStop` sleep 5 | Gives the Service time to stop sending requests before the process exits. |
| CPU 50m request, 250m limit | The process is idle almost all the time. The limit stops a tight loop from taking a kind node. |
| Memory 96Mi request, 192Mi limit | A running pod measured about 70MB RSS. 96Mi is enough to schedule it honestly. 192Mi leaves room for a burst and kills a leak before it takes the node. |
| Read-only root filesystem | The image is stateless. `/tmp` is an emptyDir. Postgres is not locked down the same way, because its entrypoint starts as root to fix the data directory and then drops to the `postgres` user. |

State lives in Postgres, on the PersistentVolume `vocabulary-pg`. The API pods store nothing. Losing an API pod loses no words. Losing the database pod's node loses the words.

Rolling update and rollback, from `docs/evidence/rollout-summary.txt`. `kubectl set env` moved `APP_VERSION` from 1 to 2, then `kubectl rollout undo` put it back. 565 probes, all 200. The body was version 1 on 533 of them and version 2 on 32, so the new pods really did take traffic and the rollback really did return to the previous revision. The forward rollout finished in about six seconds (07:47:19Z to 07:47:25Z) and the rollback by 07:47:34Z. No failed probe.

```
samples 565
ok 565
failed 0
saw version 1: 533
saw version 2: 32
longest gap seconds 0.000
```

`kubectl rollout undo` warned that the Deployment had also been managed with `kubectl apply`, so the last-applied annotation is not rewritten by the undo. The next `kubectl apply -f k8s/api.yaml` is the source of truth and sets `APP_VERSION` back to the ConfigMap value. I would use that in a real rollback if the undo and the file had drifted.

## Operations

Health is `GET /health`. Logs are stdout JSON, read with `kubectl -n vocabulary logs deploy/vocabulary-api`. The runbook is `docs/RUNBOOK.md`. The first three checks are: pod status, the health URL, and whether a node is still cordoned.

Cost, if it ran continuously: on this laptop, electricity only, under a dollar on top of a machine that is already on. The same shape on AWS all month is roughly $140: about $73 for an EKS control plane, $30 for two t3.small workers, $20 for a load balancer, and $15 for a small Postgres. The first cut is the control plane. For a word list used before class, I would run the containers on one small VM and turn it off when nobody is studying, or stay on the laptop. These are ballpark prices, not a quote.

## Source control

The work is on `feature/vocabulary-service`, in small commits, and merged through [pull request 1](https://github.com/Maliranda/Final210/pull/1). The review comment on `k8s/api.yaml` is about why readiness checks the database and liveness does not. The pipeline on `main` is the green run that publishes the image.

## Presentation

Five to ten minutes. Show a green pipeline run, `./scripts/failover-demo.sh`, and `./scripts/rollout-demo.sh`. Bring the cluster up before the session and destroy it after. The commands are in the runbook.
