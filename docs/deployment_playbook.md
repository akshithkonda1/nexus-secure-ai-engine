# Deployment Playbook

## 1. Docker Build
docker build -t ryuzen-engine:latest .

## 2. Local Deployment
docker compose up --build

## 3. Kubernetes Deployment
kubectl apply -f k8s/

## 4. Helm
helm install ryuzen ./helm

## 5. Terraform (AWS/Azure/GCP)
terraform init
terraform plan
terraform apply

## 6. Health Checks
GET /api/v1/health
GET /api/v1/telemetry/summary

## 7. Scaling
- API replicas: 3+
- Toron engine worker pool: autoscale 4–32
- Redis / Dynamo / Postgres for session state (optional)
