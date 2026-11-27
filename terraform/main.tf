# The course cluster is minikube. Terraform has no minikube resource, so this
# runs the same `minikube start` used in class and deletes that profile on destroy.
# The triggers do not change between applies, so a second plan is empty.
resource "null_resource" "minikube" {
  triggers = {
    profile   = var.cluster_name
    nodes  = "3"
    driver = "docker"
    cpus   = "2"
    memory    = "2048"
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    working_dir = path.module
    command     = <<-EOT
      set -euo pipefail
      minikube start \
        --profile='${var.cluster_name}' \
        --driver=docker \
        --nodes=3 \
        --cpus=2 \
        --memory=2048 \
        --wait=true
      kubectl config view --context='${var.cluster_name}' --minify --flatten \
        > kubeconfig
    EOT
  }

  provisioner "local-exec" {
    when        = destroy
    interpreter = ["/bin/bash", "-c"]
    command     = "minikube delete --profile='${self.triggers.profile}'"
  }
}
