# Rollback Playbook

## Blue/Green Rollback
1. Run GitHub Action `Automatic Blue/Green Rollback` with `failed_env` set to the unhealthy stack.
2. Validate DNS/ALB weights return to stable side via `traffic_shift.sh` at 100%.
3. Confirm health checks on stable environment; keep failing stack for forensics.

## Canary Rollback
1. From CI, abort the canary workflow or run `canary_controller.py` with prior config to set weight 0%.
2. Ensure Route53 weighted record returns to stable alias target.
3. Mark deployment as failed in release notes and open incident.

## Kubernetes Rollback
1. Identify last good ReplicaSet: `kubectl rollout history deploy/toron-engine -n <env>`.
2. Execute: `kubectl rollout undo deploy/toron-engine -n <env>`.
3. Verify: `kubectl rollout status deploy/toron-engine -n <env>` and run smoke test.

## Config Rollback
1. Restore previous ConfigMap from Git history or backup: `kubectl apply -f configmap.yaml -n <env>`.
2. Restart pods to pick up config: `kubectl rollout restart deploy/toron-engine -n <env>`.

## Provider Disable Switch
- Patch ConfigMap to remove a provider or set `circuit_breaker_open=true` to stop traffic to failing dependencies.

## Communication
- Update incident channel and status page after rollback completes.
- File follow-up tasks for root cause and test coverage.
