# Public Beta Readiness

## Purpose
Outline the operational, security, and product readiness requirements for moving TestOps and Toron v2.5H+ into public beta.

## Architecture
- HA deployment with at least two Runner replicas and redundant SSE gateways.
- Snapshot storage replicated; periodic integrity checks.
- Observability stack with alerting for determinism drops, latency breaches, and PII violations.

### Interaction Diagram
```
[HA Runner] -> [Engine] -> [Snapshots]
      |            |            \
      v            v             v
[SSE/Alerts]   [Reports] --> [Warroom]
```

## Component Interaction
1. CI delivers artifacts; deployment runs with redundancy enabled.
2. Reports monitored for SLO breaches; Warroom escalates incidents.
3. Snapshots refreshed and compared routinely to ensure determinism.

## API References
- `POST /v1/deploy/preview` — stage preview for beta.
- `GET /v1/health` — confirm HA readiness.
- `GET /v1/reports/{id}` — read SLO compliance.

## Checklist
- [x] All hardening phases 4–9 completed; artifacts attached.
- [x] Chaos and load SLOs met for 7 consecutive days.
- [x] Telemetry compliance reports delivered to security; no open critical findings.
- [x] Warroom incident templates published; rollback rehearsed.
- [x] Documentation suite (this repo) version tagged in release notes.

## Command Examples
- `gh workflow run testops-ci.yml --ref main` (manual trigger)
- `make beta-check`
- `python tools/decision_record.py --run-id <id> --decision go`

## Troubleshooting
- **Late regression failure**: roll back to previous snapshot tag and re-run determinism.
- **SLO breach**: open Warroom incident, adjust load profiles, and re-test.
- **Telemetry alert**: quarantine offending payloads and rotate salt if required.

## Upgrade Paths
- For new engine patches, re-run determinism and refresh public beta docs.
- For UI updates, release behind feature flags and validate via deploy-preview before enabling.

## Versioning Notes
- Public beta label uses semver with `-beta` suffix (e.g., `2.5.0-beta.1`).
- Documentation version recorded in `VERSIONING_AND_RELEASE_NOTES.md`.
