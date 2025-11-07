# terraform-k8s-cluster (local with kind)

This repository creates a local Kubernetes cluster using Terraform + kind.

## Files
- `main.tf`        : terraform resource that creates a kind cluster
- `providers.tf`   : terraform providers block (kind provider)
- `variables.tf`   : cluster variables
- `outputs.tf`     : outputs (cluster name & kubeconfig path)
- `kind-config.yaml`: kind cluster configuration
- `Makefile`       : convenience commands

## Prerequisites (Ubuntu)
- Docker installed and running
- Terraform >= 1.5.0
- kubectl (you have v1.34.1 — OK)
- curl (to install kind if needed)

## Quick setup
```bash
# 1. install prerequisites (if missing)
sudo apt update -y
sudo apt install -y docker.io unzip curl
# install terraform (example using snap)
sudo snap install terraform --classic

# 2. install kind (optional, provider will install if needed)
curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# 3. initialize terraform & create cluster
terraform init
terraform apply -auto-approve

# 4. verify
kubectl cluster-info
kubectl get nodes
kubectl get pods -A
```

## Destroy
```bash
terraform destroy -auto-approve
# if kind cluster persists, delete it manually:
kind delete cluster --name local-k8s-cluster
```

## Notes
- This repo is intended for **local development**. The structure (variables/providers/outputs) is reusable for production cloud providers (EKS/GKE) later.
- If you want Terraform to also manage Kubernetes resources (Deployments, Helm), a two-step workflow may be required because providers that interact with the cluster typically need kubeconfig to exist before being initialized.
