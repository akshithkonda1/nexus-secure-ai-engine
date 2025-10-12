# Runbook: Rate limiter saturation

## Symptoms
- Clients receive HTTP 429 responses.
- Redis CPU or memory usage spikes.
- `/status` reports degraded memory providers due to fan-out retries.

## Immediate actions
1. Confirm the reported API key in the audit logs to rule out abuse.
2. Inspect Redis metrics for connection exhaustion or latency.
3. Temporarily raise `NEXUS_RATE_LIMITS` for trusted tenants if required.

## Remediation
- Scale Redis vertically or horizontally; update `NEXUS_RATE_LIMIT_STORAGE_URL` accordingly.
- Introduce per-tenant rate limits via the Limiter configuration using blue/green deploys.
- Review recent deployments for traffic pattern changes and coordinate with SRE on long-term capacity planning.
