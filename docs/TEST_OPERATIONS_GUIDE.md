# Ryuzen TestOps System — Test Operations Guide

## Purpose
This guide defines how to plan, run, and govern tests for the Ryuzen TestOps System and the Toron v2.5H+ Engine. It ensures deterministic, offline-friendly validation that meets enterprise release, security, and compliance gates.

## Architecture Overview
- **UI Test Dashboard**: Orchestrates runs, visualizes states, and streams events via SSE.
- **API Gateway**: Authenticates calls, validates payloads, and routes commands to the Runner service.
- **Runner**: Schedules suites, injects fixtures, and delegates execution to the Toron engine.
- **Toron v2.5H+ Engine**: Executes simulations, deterministic regression suites, and chaos/load probes.
- **Snapshot Service**: Persists golden outputs for diffing and replay.
- **Reports Service**: Consolidates coverage, performance, and determinism metrics.
- **Warroom Hub**: Curates incidents, rollbacks, and postmortems.

### End-to-End Flow (UI → Warroom)
```
[UI] -> [SSE Stream] -> [TestOps API] -> [Runner] -> [Toron Engine]
          -> [Snapshot Store] -> [Reports] -> [Warroom]
```

## Component Interactions
1. UI raises a test run; SSE streams progress events.
2. API validates the request, issues a run-id, and publishes to Runner.
3. Runner orchestrates suites (lint, unit, sim, hardening, chaos/load) and emits events.
4. Toron engine executes deterministic kernels; results flow to Snapshot service.
5. Reports service aggregates KPIs (determinism ≥98%, coverage ≥90%).
6. Warroom consumes reports for go/no-go.

## Exact API References
- `POST /v1/test-runs` — create run with suite list and synthetic data set.
- `GET /v1/test-runs/{id}/events` — SSE channel for status.
- `POST /v1/snapshots/compare` — compare current vs golden snapshot.
- `GET /v1/reports/{id}` — retrieve coverage/determinism artifacts.
- `POST /v1/warroom/incidents` — open incident with failing gates.

## Operational Playbooks
- **Kick off regression**: `make testops-regression SUITE=full`.
- **Replay snapshot**: `python tools/snapshot_replay.py --run-id <id> --offline`.
- **Generate reports**: `make reports` then review `reports/index.html`.
- **Trigger chaos smoke**: `make chaos-smoke MODE=mock`.

## Troubleshooting
- **Run stuck in scheduled**: verify Runner queue health via `kubectl get pods -l app=runner`.
- **Non-deterministic sim**: re-run with `SIM_SEED=42`; check drift in `reports/determinism.json`.
- **Missing snapshot**: regenerate using `make snapshot-refresh`.
- **PII violation**: inspect `logs/pii_scrubber.log` and rerun with `PII_STRICT=1`.

## Upgrade Paths
- **Minor releases**: compatible with existing snapshots; refresh reports only.
- **Toron engine bumps**: run `V3_MIGRATION_GUIDE` steps, re-baseline deterministic sims, and update version matrix.
- **Dashboard UI**: rolling deploy with canary gated by hardening Phase 8/9.

## Versioning Notes
- Semantic versioning: TestOps `MAJOR.MINOR.PATCH` aligned to Toron engine minor releases.
- Snapshots are tagged `run-<semver>-<timestamp>` for reproducibility.

## Command Reference
- `make lint && make format` — enforce style.
- `pytest backend/tests_master --cov=backend --cov-report=xml` — regression coverage.
- `python sim/run_suite.py --profile offline` — deterministic simulations.
- `k6 run load/mock_scenarios.js` — offline load.

## Appendix: Roles
- **Operators**: initiate runs, triage failures.
- **Maintainers**: curate snapshots, author hardening gates.
- **Security**: enforce PII scrubber policies and quarantine workflows.
