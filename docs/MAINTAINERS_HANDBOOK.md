# Maintainers' Handbook

## Purpose
Equip maintainers with governance, operational, and escalation procedures for TestOps and Toron v2.5H+.

## Architecture
- **CI Gatekeeper**: monitors workflows and gates merges.
- **Snapshot Steward**: manages baselines and diff policies.
- **Warroom Coordinator**: handles incidents and decisions.

### Interaction Diagram
```
[CI Results] -> [Maintainer Review] -> [Warroom Decision]
                     |                     |
              [Snapshot Steward]     [Release Notes]
```

## Component Interaction
1. Maintainers review CI artifacts and determinism gates.
2. Snapshot steward refreshes and prunes baselines.
3. Warroom coordinator records incidents and decisions; releases tagged accordingly.

## API References
- `GET /v1/reports/{run}` — fetch artifacts.
- `POST /v1/warroom/incidents` — log incidents.
- `POST /v1/snapshots/garbage-collect` — prune baselines.

## Responsibilities
- Curate CI gates and keep thresholds strict.
- Approve releases and document decisions in Warroom.
- Manage snapshot lifecycle and storage health.
- Coordinate security reviews for telemetry and PII changes.

## Operational Playbooks
- **CI Oversight**: monitor `.github/workflows/testops-ci.yml`; ensure artifacts uploaded.
- **Snapshot Management**: weekly `tools/snapshot_gc.py --keep 20`; refresh after engine changes.
- **Incident Response**: use Warroom templates; maintain on-call rota.
- **Release Management**: align `VERSIONING_AND_RELEASE_NOTES.md` with actual artifacts and tags.

## Command Examples
- `python tools/snapshot_gc.py --keep 20`
- `python tools/decision_record.py --run-id <id> --decision go`
- `kubectl get pods -l app=runner`

## Escalation Matrix
- P0: Engine determinism failure — rollback immediately, block merges.
- P1: Telemetry/PII breach — quarantine, rotate salts, notify security lead.
- P2: CI instability — rerun offline, fix flakes, document root cause.

## Troubleshooting
- **Artifacts missing**: verify `package-artifacts` job success and storage permissions.
- **On-call gaps**: update schedule and notify stakeholders in Warroom.

## Upgrade Paths
- Revise gates when new suites added; keep thresholds conservative.
- Update incident templates alongside new subsystems.

## Versioning Notes
- Maintainer handbook revisions require two maintainer approvals.
