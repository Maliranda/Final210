output "cluster_name" {
  description = "Minikube profile name."
  value       = var.cluster_name
}

output "context_name" {
  description = "kubectl context. Minikube names it after the profile."
  value       = var.cluster_name
}

output "kubeconfig_path" {
  description = "Kubeconfig written by terraform apply. It is gitignored."
  value       = "${path.module}/kubeconfig"
}

output "api_url" {
  description = "Base URL of the API once the Service is up."
  value       = "http://127.0.0.1:${var.host_port}"
}
