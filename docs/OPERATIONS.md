# Operations Guide

## Pre-flight checklist

- [ ] Provision Redis (or Memcached) for rate-limiter storage.
- [ ] Create DynamoDB/Firestore/Azure Blob resources for memory persistence.
- [ ] Store model catalog JSON and credentials in your secrets manager.
- [ ] Generate a 256-bit data encryption key and store as `NEXUS_DATA_KEY_B64`.
- [ ] Populate `.env` from `.env.example` with production values.

## Deployment

```bash
docker compose -f docker-compose.yml --env-file .env up -d --build
```

Use blue/green deployments or rolling updates by deploying two identical stacks with separate load balancer target groups.

## Health checks

- `/health` – lightweight liveness probe.
- `/status` – detailed model and memory status (requires API key).
- `/health/last` – latest background health snapshot from the monitor thread.

## Observability

- Gunicorn streams structured logs to stdout; ship them to your log pipeline.
- Configure Prometheus scraping via the `/metrics` endpoint exported by your hosting environment (e.g., AWS CloudWatch agent).
- Use the included `tests/load/k6-smoke.js` to baseline latency before every release.

## Backups & DR

- DynamoDB: enable PITR and export to S3 weekly.
- Firestore/Azure Blob: schedule daily exports to cold storage.
- Audit logs include TTL fields; ensure the TTL index is enabled on DynamoDB tables.

## Runbooks

- [Health monitor failures](runbooks/health-monitor.md)
- [Rate limiter saturation](runbooks/rate-limiter.md)
