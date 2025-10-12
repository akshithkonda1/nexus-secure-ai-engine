# Runbook: Health monitor failures

## Symptoms
- `/health/last` returns `monitor disabled` or stale timestamps.
- Cloud alarms trigger on missing health snapshots.

## Immediate actions
1. Check application logs for `health snapshot failed` errors.
2. Ensure `NEXUS_HEALTH_ENABLE` is set to `1` and `NEXUS_HEALTH_INTERVAL_SEC` is reasonable (<3600).
3. Validate the memory backend is healthy using `/status` response.

## Remediation
- Restart the pod or container if the background thread is wedged.
- If memory writes fail, fail over to a secondary provider by updating `NEXUS_MEM_PROVIDERS` and redeploying.
- File an incident ticket and attach the `health_suite` payload.
