# Launch Day Protocol

## Pre-Flight (T-24h)
- Freeze non-essential deployments; only launch-related changes allowed.
- Confirm on-call schedule and escalation chain.
- Verify dashboards and alert routing by firing synthetic alarms.
- Ensure canary config matches production settings.

## Dry Run (T-6h)
- Deploy to green namespace using `deploy_green.yaml` pipeline.
- Run smoke and integration tests against green.
- Shift 5% traffic via `switch_traffic.yaml`; observe metrics for 30 minutes.
- Rollback rehearsal: execute `rollback.yaml` to validate automation.

## Launch (T-0)
1. Announce start in #launch channel.
2. Increment traffic to green: 25% → 50% → 100% using `traffic_shift.sh`.
3. Monitor latency, error rate, provider health, and queue depth every 5 minutes.
4. Keep blue environment warm for 4 hours post-cutover.

## Rollback Triggers
- p95 latency > 400ms for 10 minutes.
- Error rate > 2% for 5 minutes.
- PagerDuty alert: "Canary failure" or "Blue/green health failure".

## Post-Launch
- Post a metrics summary after 2 hours.
- Remove freeze once metrics stable for 4 hours.
- File retrospective tasks and backlog items.
