output "cluster_name" {
  description = "Kind cluster name."
  value       = kind_cluster.vocabulary.name
}

output "context_name" {
  description = "kubectl context written into the kubeconfig."
  value       = kind_cluster.vocabulary.context_name
}

output "kubeconfig_path" {
  description = "Kubeconfig for this cluster. It is gitignored."
  value       = kind_cluster.vocabulary.kubeconfig_path
}

output "api_url" {
  description = "Base URL of the API once the Service is up."
  value       = "http://127.0.0.1:${var.host_port}"
}
