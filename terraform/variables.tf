variable "cluster_name" {
  description = "Kind cluster name. Node names and the kubeconfig context are derived from it."
  type        = string
  default     = "vocabulary"
}

variable "host_port" {
  description = "Port on the laptop that forwards to the API NodePort."
  type        = number
  default     = 30080
}
