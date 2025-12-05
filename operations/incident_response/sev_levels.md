# Severity Levels

## SEV-0 (Full Outage)
- **SLA Impact**: 100% user impact or data loss risk.
- **Response Time**: Immediate, paging all responders.
- **Communication**: Executive bridge + status page red banner; updates every 15 minutes.
- **Actions**: Trigger automatic rollback, freeze deploys, engage vendor escalation paths.

## SEV-1 (Partial Outage)
- **SLA Impact**: >20% errors or critical feature unavailable.
- **Response Time**: Within 10 minutes.
- **Communication**: Incident bridge; status page orange; updates every 20 minutes.
- **Actions**: Prioritize rollback/circuit-breaker, validate cache/database health.

## SEV-2 (Performance Degradation)
- **SLA Impact**: Latency or error rates above SLO but core functionality intact.
- **Response Time**: Within 30 minutes.
- **Communication**: Slack incident channel; status page yellow if user-facing.
- **Actions**: Scale up via HPA override, trim heavy workloads, monitor canary metrics.

## SEV-3 (Non-Urgent)
- **SLA Impact**: Minor issues, cosmetic bugs, or noisy alerts.
- **Response Time**: Within business hours.
- **Communication**: Ticket only; optional Slack thread.
- **Actions**: Schedule fix, improve alert thresholds, add tests.
