# Toron Engine Incident Runbook

## Primary Goals
- Restore service availability quickly.
- Contain blast radius (traffic shifts, circuit breakers, provider disablement).
- Preserve forensics (logs, traces, metrics, timelines).

## Initial Triage
1. **Acknowledge PagerDuty incident** and join the bridge.
2. **Identify scope** from CloudWatch dashboards: request volume, latency, error rate, queue depth.
3. **Capture timeline** in the incident doc.

## Diagnostics
- **Distributed Traces**: query X-Ray/Jaeger for high-latency segments, filter by `trace.attribute.environment`.
- **Application Logs**: `kubectl logs deploy/toron-engine -n <env> -c toron-engine --tail=300`.
- **Canary Controller Logs**: `kubectl logs job/toron-canary-controller -n <env>` to see step progression, health scores, and rollbacks.
- **Provider Health**: check `observability/cloudwatch_dashboards/provider_health_dashboard.json` metrics via AWS console or `aws cloudwatch get-metric-data` for provider-specific failures.
- **Database/Cache**: `aws dynamodb describe-table --table-name toron-sessions` and `redis-cli -h $REDIS_HOST INFO`.

## Containment Actions
- **Traffic Shift Blue/Green**: run GitHub Action `Switch Traffic Between Blue and Green` with target env stable side.
- **Canary Rollback**: execute `deploy/canary/canary_controller.py` with rollback option by reapplying previous DNS weights.
- **Provider Disable**: patch ConfigMap to remove failing provider and reload pods:
  ```bash
  kubectl -n <env> patch configmap toron-config -p '{"data":{"provider_priority":"openai,anthropic"}}'
  kubectl -n <env> rollout restart deploy/toron-engine
  ```
- **Circuit Breaker**: toggle via ConfigMap key `circuit_breaker_open=true` to shed load if downstream is failing.

## Recovery Steps
1. Verify pods healthy: `kubectl rollout status deploy/toron-engine -n <env>`.
2. Run smoke test: `kubectl -n <env> exec deploy/toron-engine -- curl -fsS http://localhost:8080/healthz`.
3. Gradually restore traffic using `deploy/blue_green/traffic_shift.sh` or canary controller.
4. Confirm metrics return to normal thresholds.

## Closure
- Postmortem within 48 hours for SEV-0/1.
- Attach dashboards, timelines, and remediation items to the incident ticket.
