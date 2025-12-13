# Beta Go/No-Go Checklist

## Purpose
Provide a deterministic decision framework for advancing TestOps and Toron v2.5H+ into beta milestones.

## Architecture
- **Runner + Reports** aggregate metrics.
- **Warroom** records decisions and incidents.
- **Snapshot Store** provides baselines for comparison.

### Decision Flow Diagram
```
[CI Artifacts] -> [Reports Aggregator] -> [Checklist Evaluation] -> [Warroom Decision]
```

## Component Interaction
1. CI publishes artifacts (coverage, sim, load, chaos, hardening) to Reports.
2. Maintainers populate checklist matrix and open Warroom record.
3. Decision logged with run-id and version, then attached to release notes.

## API References
- `GET /v1/reports/{run}` — retrieve metrics for checklist.
- `POST /v1/warroom/decisions` — record go/no-go outcome.
- `GET /v1/snapshots/compare` — verify drift status pre-decision.

## Pre-Checks
- [x] All CI jobs green (lint, unit, sim, hardening, chaos/load, snapshot-compare, build).
- [x] Determinism ≥98% and coverage ≥90%.
- [x] Telemetry compliance reports current; no PII leakage.
- [x] Snapshots refreshed and stored with version tags.
- [x] Warroom incidents resolved; rollback tested.

## Go/No-Go Matrix
```
Criterion                  Threshold                  Status
-------------------------------------------------------------
Determinism                >= 98%                     [   ]
Coverage                   >= 90%                     [   ]
Chaos Recovery             < 2m                       [   ]
Load p95 Latency           Within SLO                 [   ]
Security Findings          0 critical/high            [   ]
PII/Telemetry Compliance   Pass                       [   ]
Docs & Runbooks            Published                  [   ]
Rollback Drill             Successful                 [   ]
Stakeholder Sign-off       Recorded                   [   ]
```

## Command Examples
- `make beta-check` — aggregates metrics and populates matrix.
- `python tools/decision_record.py --run-id <id> --decision go`.

## Troubleshooting
- **Missing artifacts**: re-run `package-artifacts` workflow step.
- **Conflicting metrics**: prioritize determinism and security gates; require rerun if conflicting.

## Upgrade Paths
- Refresh checklist template when new suites are added.
- Keep Warroom decision schema in sync with `VERSIONING_AND_RELEASE_NOTES.md` expectations.

## Versioning Notes
- Checklist template version stored in this file; reference run-id in release notes.
