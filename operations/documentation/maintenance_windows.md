# Maintenance Windows

## Communication
- Announce at least 48 hours in advance in #engineering and status page planned maintenance.
- Include scope, expected impact, rollback owner, and test plan.
- Provide live status updates every 30 minutes during the window.

## Freeze Windows
- Code freeze during major launches or peak business events.
- Only emergency fixes and security patches allowed during freeze.

## Deployment Windows
- Standard deployments: Monday–Thursday 14:00–18:00 UTC.
- High-risk changes (schema, provider integration): Tuesday 14:00 UTC with SRE present.

## Controlled Config Updates
- Use GitOps/PR-based changes for ConfigMaps and secrets.
- Require dual approval for provider priority changes and circuit breaker toggles.
- After config apply, monitor metrics for 30 minutes and be ready to rollback.
