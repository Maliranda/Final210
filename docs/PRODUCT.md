# Product definition — Vocabulary Builder

## What it does, and who uses it

Vocabulary Builder is a word list for someone learning a language. The user adds a term and a definition while they are reading, comes back to the list later, and marks a word learned once they know it. The people who use it are students, mostly before a class or a quiz. I built the React interface for this in earlier web-programming projects (Projects 3, 4, and 5 in this repository: the custom hook, the Zustand store, and Firebase persistence). Those projects are mine. This course does not add screens. It runs the word list as a service I can deploy, break, and put back.

## Core entities

A word is the entity this deployment stores. It has a term, a definition, a mastery level (1 = new, 2 = learned), and the time it was added. One Postgres table, `words`, holds those rows.

The original application also has word lists (folders of words) and practice sessions (a mode, a score, and which words changed mastery). I left both of those in the React app. They are real parts of the product, and they are out of scope here. The brief asked for a small service. Two or three operations and one table are enough to exercise the pipeline, the cluster, and the failover.

## What an hour of downtime costs

The list is the only copy of the words the student saved. If the service is down for an hour, they cannot add a word they just looked up, and they cannot check the list they were going to revise. That hour is often the hour before class. Nothing is billed and nobody is stranded, but the product failed at the moment it was needed, and a word that was not saved is lost. That is the reason for two API replicas on two nodes, health checks that take a pod out of rotation when it cannot reach the database, and a rolling update that brings a new pod up before it drops an old one. It is also the reason I am not pretending the database is highly available. One Postgres pod is still a single point of failure, and the write-up names it.

## Operations implemented

1. Add a word. `POST /api/words` with a term and a definition. The word starts at mastery 1.
2. List words. `GET /api/words` returns the rows in the order they were added.
3. Update mastery. `PATCH /api/words/:id` sets mastery to 1 or 2.

`GET /health` is the check the probes and a human both use. It returns 200 only when this process can run `SELECT 1` against Postgres.

## Deployment track

Local multi-node minikube, started by Terraform, on my machine. Minikube is the local Kubernetes from this course. I chose it over AWS because the availability question is the same — traffic has to survive losing one backend — and a load balancer plus two availability zones would cost money I would then have to tear down. The cluster is one control-plane and two workers (`minikube start --nodes=3`). The API is a Deployment of two replicas. Postgres stays on one worker so that draining the other worker removes an API pod and not the data. The demonstration is that drain, with a client probing the Service the whole time.
