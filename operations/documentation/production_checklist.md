# Production Readiness Checklist

- [ ] Load testing completed with p95 < 300ms at 2x expected peak.
- [ ] Error budget defined and tracked for Toron Engine v2.0.
- [ ] CloudWatch dashboards deployed (`observability/cloudwatch_dashboards/*`).
- [ ] Alert policies configured and SNS → PagerDuty integration validated.
- [ ] Secrets rotation validated; IRSA role `toron-engine-irsa` has least privilege.
- [ ] ConfigMap defaults reviewed (provider priority, cache strategy, circuit breaker off by default).
- [ ] Canary controller dry-run executed in staging with rollback validation.
- [ ] Blue/green deploy rehearsed with synthetic traffic.
- [ ] Cache warm-up job scripted and tested before cutover.
- [ ] VPC firewall rules verified for egress to all providers.
- [ ] TLS certificates validated and not expiring in <30 days.
- [ ] DNS failover (Route53 weighted) tested with `traffic_shift.sh` at 10% increments.
- [ ] Runbooks and SEV levels reviewed with on-call team.
- [ ] Backup/restore of stateful dependencies (Redis snapshots, DynamoDB PITR) validated.
- [ ] GitHub Actions secrets present (AWS roles, PagerDuty webhook, ECR access).
