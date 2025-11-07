output "cluster_name" {
  description = "Name of created kind cluster"
  value       = var.cluster_name
}

output "kubeconfig_path" {
  description = "Path where kind writes kubeconfig"
  value       = local.kubeconfig_path
}
