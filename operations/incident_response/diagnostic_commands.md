# Diagnostic Commands

## Kubernetes
- Pods state: `kubectl get pods -n <env> -o wide`
- Describe pod: `kubectl describe pod <pod> -n <env>`
- Logs: `kubectl logs <pod> -n <env> --since=30m`
- Exec health: `kubectl -n <env> exec deploy/toron-engine -- curl -fsS http://localhost:8080/healthz`
- HPA: `kubectl get hpa toron-engine-hpa -n <env> -o yaml`

## AWS CLI
- CloudWatch metric samples: `aws cloudwatch get-metric-data --metric-data-queries file://queries.json`
- ECR image list: `aws ecr list-images --repository-name toron-engine`
- Route53 weights: `aws route53 list-resource-record-sets --hosted-zone-id $ZONE --query "ResourceRecordSets[?Name=='api.toron.ai.']"`
- EventBridge events: `aws events list-rule-names-by-target --target-arn $TARGET`

## Logs & Traces
- CloudWatch logs: `aws logs tail /aws/eks/toron/containers --since 1h`
- Jaeger UI: follow runbook link and filter by `toron-engine` service.

## Local Reproduction
- Start API locally: `make run-local`
- Replay failing request: `curl -X POST http://localhost:8000/v2/complete -d @payload.json`
- Enable debug logging: set `TORON_LOG_LEVEL=DEBUG` before running.
