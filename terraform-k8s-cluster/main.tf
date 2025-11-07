locals {
  kubeconfig_path = "~/.kube/config"
}

resource "null_resource" "ensure_kind_cluster" {
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = <<EOT
set -euo pipefail

# cluster name provided by Terraform at runtime
CLUSTER_NAME="${var.cluster_name}"

echo "Using kind cluster name: ${var.cluster_name}"

# Check Docker availability
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker not found. Install Docker and start the daemon."
  exit 2
fi

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon not running or permission denied."
  exit 2
fi

# Install kind if missing
if ! command -v kind >/dev/null 2>&1; then
  echo "Installing kind..."
  curl -sSLo /tmp/kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64
  chmod +x /tmp/kind
  sudo mv /tmp/kind /usr/local/bin/kind
fi

# Create cluster if not exists (use config file if present)
if kind get clusters | grep -qE "^${var.cluster_name}\$"; then
  echo "kind cluster '${var.cluster_name}' already exists. Skipping creation."
else
  echo "Creating kind cluster '${var.cluster_name}'..."
  if [ -f "${path.module}/kind-config.yaml" ]; then
    kind create cluster --name "${var.cluster_name}" --config "${path.module}/kind-config.yaml"
  else
    kind create cluster --name "${var.cluster_name}"
  fi
fi

# Export kubeconfig for commands that follow (shell-only variable)
export KUBECONFIG="$${HOME}/.kube/config"
echo "KUBECONFIG: $${KUBECONFIG}"

# Show kubectl client info (best-effort)
kubectl version --client || true
kubectl cluster-info --context kind-${var.cluster_name} >/dev/null 2>&1 || true

echo "Cluster '${var.cluster_name}' is ready."
EOT
  }
}
