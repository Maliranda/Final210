resource "kind_cluster" "vocabulary" {
  name            = var.cluster_name
  kubeconfig_path = "${path.module}/kubeconfig"
  wait_for_ready  = true

  # The provider cannot update a cluster in place. Changing a node forces a new one.
  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      extra_port_mappings {
        container_port = var.host_port
        host_port      = var.host_port
        listen_address = "127.0.0.1"
        protocol       = "TCP"
      }
    }

    # Postgres is pinned here so a drain of the other worker does not take the data with it.
    node {
      role = "worker"
      labels = {
        vocabulary-role = "database"
      }
    }

    node {
      role = "worker"
      labels = {
        vocabulary-role = "app"
      }
    }
  }
}
