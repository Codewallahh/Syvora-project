init:
	terraform init

apply:
	terraform apply -auto-approve

destroy:
	terraform destroy -auto-approve
	kind delete cluster --name $(shell terraform output -raw cluster_name 2>/dev/null || echo local-k8s-cluster) || true
