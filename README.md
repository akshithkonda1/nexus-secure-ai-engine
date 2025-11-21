# Ryuzen Toron v1.6

## Overview
Ryuzen Toron v1.6 is a production-ready orchestration engine that powers the secure AI experience behind the Ryuzen platform. The backend exposes a hardened FastAPI gateway, region-aware rate limiting, and an opinionated Toron Engine pipeline designed for low-latency responses and safe frontend interoperability.

## Multi-cloud orchestration
The Toron Engine abstracts provider differences and routes workloads across multiple clouds. A lightweight model router provides deterministic fallbacks while the orchestrator records audit trails for observability.

## Zero-knowledge architecture
All ingress payloads are decrypted in-memory via AES-256-GCM and scrubbed for PII prior to processing. No plaintext leaves the request boundary, enabling zero-knowledge data handling across services and connectors.

## Multi-model debate engine
Requests pass through a multi-reviewer debate stage to blend reasoning and guard-rail perspectives. Consensus outputs feed the orchestrator for summarization and telemetry logging.

## Connectors
The unified connectors layer exposes discovery and synchronization endpoints for provider integrations (GitHub, Google, Outlook, and more). State is tracked centrally to keep the frontend command center in sync.

## Telemetry
Telemetry aggregation captures per-model counters, latency, and timestamps so that dashboards can display the health of ongoing operations. Summaries are exportable through the API when opted in by the user.

## Session pooling
Concurrency gates and per-user rate limiters keep the engine responsive under load. Warmup hooks pre-initialize the orchestration stack for fast handshakes.

## Region-aware rate limits
Global and user-aware limiters can be tuned per region to respect regulatory and capacity boundaries, ensuring graceful degradation instead of hard failures.

## Security model (AES-256 + PII scrub)
Inbound payloads are decrypted with AES-256-GCM, sanitized to remove PII markers, routed for processing, and re-encrypted before leaving the gateway. Secure memory helpers wipe sensitive buffers after use.

## Architecture diagram
The Mermaid source for the system diagram lives at `docs/architecture.mmd`.

## Folder structure
```
src/
  backend/
    core/toron/engine/
    retriever/
    connectors/
    rate_limit/
    telemetry/
    health/
    security/
    utils/
    api/
docker/
k8s/
helm/
terraform/
tests/
docs/
.github/workflows/
```

## Local development
```sh
make run
```
This launches the FastAPI gateway on `http://0.0.0.0:8080` with CORS enabled and tracing headers set for frontend calls.

## Docker & Compose usage
Build the engine container locally with:
```sh
make docker
```
A `docker-compose.yml` example is included for multi-service development.

## Helm deployment
The `helm/` chart packages the service for Kubernetes environments. Update values as needed, then deploy through your preferred CI/CD orchestrator.

## Terraform deployment
The `terraform/` directory contains infrastructure blueprints for provisioning cloud resources and secrets required by the engine.

## Frontend integration endpoints
- `POST /api/v1/ask` — decrypts, sanitizes, orchestrates via ToronEngine, and returns encrypted text (supports SSE streaming when `stream=true`).
- `GET /api/v1/health` — returns `HealthMonitor.status()` for readiness probes.
- `GET /api/v1/telemetry/summary` — exports telemetry aggregates for the Command Center.
- `GET /api/v1/connectors` — retrieves connector states.
- `POST /api/v1/connectors/sync` — triggers sync for all connectors.
- `GET /api/v1/models` — lists model catalog from the router.
- `WS /ws/stream` — streams tokens in real time for interactive sessions.

## Testing & CI/CD
Run the full backend test suite and generate an HTML report with:
```sh
make test
```
Formatting helpers are available via `make fmt`. CI/CD workflows are configured under `.github/workflows/` to validate builds, run tests, and publish deployment artifacts.
