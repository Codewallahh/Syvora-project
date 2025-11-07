variable "cluster_name" {
  description = "Name of the local kind cluster"
  type        = string
  default     = "local-k8s-cluster"
}

variable "node_count" {
  description = "Number of worker nodes (kept for future use)"
  type        = number
  default     = 2
}
