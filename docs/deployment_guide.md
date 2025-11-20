# Deployment Guide

## Build the Docker image
```bash
docker build -f docker/Dockerfile -t toron-engine:latest .
```

## Run locally with Compose
```bash
cd docker
docker compose up -d
```

## Apply the Helm chart
```bash
helm upgrade --install toron ./helm/toron \
  --set image.repository=toron-engine \
  --set image.tag=$(git rev-parse --short HEAD)
```

## Configure Terraform state backend
Each cloud stack defines a backend block. Override during init as needed:
```bash
cd terraform/aws
terraform init -backend-config="bucket=my-bucket" -backend-config="region=us-east-1"
terraform plan -var="image_tag=$(git rev-parse --short HEAD)"
```

## Environment variables
- `TORON_PORT`: HTTP port (default: 8080)
- `TORON_LOG_LEVEL`: Application log level
- `TORON_DEFAULT_PROVIDER`: Preferred cloud provider

Store sensitive settings in `.env` for local use or Kubernetes Secrets for clusters.
