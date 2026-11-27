variable "cluster_name" {
  description = "Minikube profile name. The kubectl context uses the same name."
  type        = string
  default     = "vocabulary"
}

variable "host_port" {
  description = "Port on the laptop that forwards to the API NodePort."
  type        = number
  default     = 30080
}
