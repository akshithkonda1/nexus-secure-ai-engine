# Cloud Deployment Guide (Offline-Safe)

## Purpose
Describe how to deploy TestOps and Toron v2.5H+ across clouds using offline-capable artifacts and synthetic data.

## Architecture
- **Helm Charts**: parameterized for offline registries and blob emulators.
- **Terraform Modules**: provision compute/storage placeholders without external API calls when mocked.
- **Runner + Engine Pods**: run simulations; connect to internal MinIO-style storage.
- **Observability Stack**: Prometheus/Grafana with local exporters.

### Deployment Flow
```
[Helm values] -> [Helm install] -> [K8s objects] -> [Runner/Engine Pods]
                                           \-> [Snapshot PVC] -> [Reports PVC]
```

## Component Interaction
1. Render manifests from Helm values; validate with kubeconform.
2. Apply manifests to target cluster; Runner/Engine pods start and mount PVCs.
3. Observability stack scrapes metrics; Reports stored locally.

## API References
- `POST /v1/deploy/preview` — trigger preview deploy (used by CI).
- `GET /v1/health` — check readiness of API/Runner.
- `POST /v1/snapshots/seed` — initialize golden snapshots after deploy.

## Prerequisites
- Local registry mirror available (or packaged images).
- Access to synthetic secrets in `deploy/offline-values.yaml`.
- Kubectl and Helm v3 installed.

## Command Examples
1. Render manifests: `helm template deploy/testops -f deploy/offline-values.yaml > out.yaml`.
2. Validate: `kubeconform out.yaml`.
3. Apply: `kubectl apply -f out.yaml`.
4. Verify pods: `kubectl get pods -l app=testops`.
5. Seed snapshots: `kubectl exec deploy/runner -- make snapshot-refresh`.

## Troubleshooting
- **Image pull error**: confirm registry mirror and image digest matches `VERSIONING_AND_RELEASE_NOTES.md`.
- **PVC pending**: switch to local-path provisioner in values file.
- **Ingress failures**: ensure offline ingress class available; otherwise use `kubectl port-forward`.

## Upgrade Paths
- For minor updates: rolling upgrade via Helm with `--atomic`.
- For major changes: blue/green by deploying `testops-green` and swapping ingress when healthy.
- Refresh snapshots and run `snapshot-compare` after upgrade.

## Versioning Notes
- Chart version follows TestOps semver; pinned image digests prevent drift.
