# This is Ryuzen, an AI ecosystem 










# Toron v1.6 — Ryuzen Engine

The Toron engine is a cloud-neutral orchestration layer that secures prompts and responses with AES-256, masks PII, and exposes connectors for AWS, Azure, and GCP model backends. This repo packages the engine with container tooling, Helm charts, Terraform plans, and a full pytest harness so you can ship the system with confidence.

## Repository layout
```
.
├── docker/                 # Dockerfile and compose for local runs
├── k8s/                    # Raw Kubernetes manifests
├── helm/toron/             # Helm chart for configurable releases
├── terraform/              # AWS, Azure, and GCP infrastructure plans
├── toron/                  # Python engine primitives
├── src/backend/server.py   # Flask entrypoint for container images
├── tests/                  # Unit tests, fixtures, and pytest config
├── docs/                   # Architecture + deployment + testing guides
└── .github/workflows/      # CI/CD automation
```

## Local development
- **Python server**: `python src/backend/server.py`
- **Docker image**: `docker build -f docker/Dockerfile -t toron-engine:latest .`
- **Compose**: `cd docker && docker compose up -d` (loads `.env` and maps port 8080)

## Deployments
- **Kubernetes manifests**: `kubectl apply -f k8s/`
- **Helm chart**: `helm upgrade --install toron ./helm/toron --set image.tag=$(git rev-parse --short HEAD)`
- **Terraform**: initialize the target cloud under `terraform/aws`, `terraform/azure`, or `terraform/gcp`, then `terraform plan -var="image_tag=$(git rev-parse --short HEAD)"`

## Testing
- `pip install -r requirements-dev.txt`
- `pytest` (HTML report written to `reports/report.html`, coverage to `htmlcov/`)
- `make test` shortcut for `pytest --cov=toron --cov-report=html`

## Contributing
1. Create a feature branch and include tests for new behaviour.
2. Run `pytest` locally; CI enforces coverage ≥ 90%.
3. Update docs in `docs/` when you change deployment or testing flows.

## Security model
- **Encryption**: AES-256-GCM helpers enforce authenticated encryption.
- **PII pipeline**: deterministic redaction and masking for emails, phones, and names.
- **Secrets**: inject via `.env` locally, Kubernetes Secrets in clusters, or Terraform variables; never commit plaintext credentials.

## Documentation
- [Architecture Mermaid](docs/architecture.mmd)
- [Deployment Guide](docs/deployment_guide.md)
- [Testing Guide](docs/testing_guide.md)
