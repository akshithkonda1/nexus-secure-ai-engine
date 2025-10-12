# Nexus Engine Architecture Overview

## High-level components

1. **Gateway (Flask + Gunicorn)**
   - Authenticates requests using API keys.
   - Enforces HTTPS, payload limits, rate limiting, and request sanitisation.
   - Persists audits, scopes, and webhooks to DynamoDB when configured.

2. **Engine Core (`nexus_engine.py`)**
   - Orchestrates debate pipelines across multiple model connectors.
   - Applies consensus and weighted result policies.
   - Provides SSRF-safe web retrieval with host allow/deny lists and robots.txt caching.

3. **Bootstrap (`bootstrap.py`)**
   - Resolves secrets from AWS/Azure/GCP providers.
   - Loads the model catalog from env files, file paths, or secret manager entries.
   - Constructs strongly-typed `ModelConnector` instances with validated TLS endpoints.

4. **Memory subsystem (`memory_compute.py`)**
   - Provides durable chat history adapters for DynamoDB, Firestore, and Azure Blob Storage.
   - Exposes a multi-store orchestrator with fan-out writes and health verification.

5. **Configuration (`nexus_config.py`)**
   - Loads JSON config overlays and environment overrides.
   - Validates provider selections, connector requirements, and TTL semantics.

## Data flow

```text
Client -> Flask Gateway -> Engine.run()
                     |-> MultiMemoryStore.save()
                     |-> ModelConnector.invoke()
                     |-> WebRetriever.search_all()
```

1. A client sends a JSON payload to `/debate`.
2. Gateway validates API key, origin, content size, and sanitises inputs.
3. Engine orchestrates debate across configured models, optionally scraping web sources.
4. Memory writes persist the conversation, and audit events stream to DynamoDB.
5. Response returns deterministic schema with policy metadata and encrypted payloads if enabled.

## Deployment topology

- **Stateless application layer**: Gunicorn workers behind a load balancer.
- **Persistent data stores**:
  - DynamoDB/Firestore/Azure Blob for chat history.
  - Redis/Memcached for rate-limiter state.
  - Cloud secrets manager for model credentials.
- **Observability**: CloudWatch/Stackdriver/Application Insights for logs; Prometheus exporters for metrics.

## Security boundaries

- All model connectors require HTTPS endpoints.
- Rate limiting leverages a persistent backend to resist worker restarts.
- Web retrieval guard rails prevent connections to private networks and enforce domain policies.
- Audit logs capture every privileged action with TTL-based retention.
