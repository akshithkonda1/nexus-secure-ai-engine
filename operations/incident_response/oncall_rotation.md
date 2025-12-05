# On-Call Rotation

## Schedule
- Primary rotation: weekly handoff on Mondays 10:00 UTC.
- Backup rotation: mirrors primary; shadow on-call joins bridges.
- SRE liaison joins for SEV-0/1 regardless of rotation.

## Handoff Protocol
1. Review prior week's incidents and unresolved follow-ups.
2. Confirm PagerDuty schedules and override windows.
3. Validate runbook links, dashboards, and alert noise levels.
4. Share maintenance windows or high-risk deployments for the week.

## Escalation Chain
1. **Primary On-Call** → acknowledges within target response time.
2. **Backup On-Call** → if no response within 5 minutes for SEV-0/1.
3. **SRE Manager** → if incident extends beyond 60 minutes without containment.
4. **Product Lead** → consulted when user-visible impact exceeds SLA or rollback is blocked.
