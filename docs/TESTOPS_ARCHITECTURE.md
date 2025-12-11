# TestOps Architecture

## Purpose
Detail the end-to-end architecture for the Ryuzen TestOps System, highlighting flows from UI to Warroom and the Toron v2.5H+ engine.

## High-Level Stack
- **UI Dashboard** (React/Next): issues runs, visualizes state, streams updates via SSE.
- **SSE Gateway**: bridges UI to API events with backpressure and reconnect handling.
- **API Layer** (FastAPI): auth, validation, routing to orchestration.
- **Runner**: schedules suites, allocates resources, handles retries.
- **Toron v2.5H+ Engine**: deterministic simulation core with snapshotting.
- **Snapshot Service**: golden baselines, delta detection, replay control.
- **Reports Service**: coverage, performance, determinism, and hardening KPIs.
- **Warroom**: incident creation, rollback triggers, postmortem archives.

### End-to-End Diagram (UI → Warroom)
```
[UI] -> [SSE] -> [API] -> [Runner] -> [Engine] -> [Snapshots] -> [Reports] -> [Warroom]
          ^                                    |                         |
          |                                    v                         v
          +---------< health / metrics >-------+-----< alerting >-------+
```

## Component Interaction Details
1. UI issues `POST /v1/test-runs` with suite configuration and synthetic data profile.
2. API authenticates, persists metadata, emits run-id to SSE.
3. Runner dequeues tasks, executes lint/unit/sim/hardening/chaos/load stages.
4. Toron engine executes deterministic kernels, producing snapshot bundles (`snapshots/run-<id>.tar.gz`).
5. Snapshot service performs diffs against previous baselines; triggers `snapshot-compare` job.
6. Reports service aggregates coverage (XML), determinism (JSON), and performance (HTML).
7. Warroom receives incident payloads when gates fail and renders go/no-go dashboards.

## API Reference (Essential)
- `POST /v1/test-runs`
- `GET /v1/test-runs/{id}`
- `GET /v1/test-runs/{id}/events`
- `POST /v1/hardening/execute`
- `POST /v1/chaos/run`
- `POST /v1/load/run`
- `POST /v1/snapshots/compare`

## Command Examples
- `make testops-regression SUITE=full`
- `python tools/snapshot_compare.py --base snapshots/golden --target snapshots/dev`
- `python sim/run_suite.py --profile offline --suite regression_core`

## Data Flows
- **Config → Runner**: YAML/JSON suite definitions validated by API schema.
- **Results → Snapshot**: deterministic outputs stored under `snapshots/` with seed info.
- **Metrics → Reports**: aggregated from pytest, k6, hardening scripts.
- **Alerts → Warroom**: webhook payloads enriched with build metadata and suite gates.

## Reliability Patterns
- Idempotent run creation using run-id hashing.
- Replayable seeds via `SIM_SEED` and `CHAOS_SEED` environment variables.
- Backpressure on SSE to avoid UI overrun; events buffered per run-id.
- Offline mode: all datasets synthetic; no external API calls.

## Upgrade and Versioning
- Use `VERSIONING_AND_RELEASE_NOTES.md` for compatibility matrix.
- New Toron minor releases require snapshot refresh and determinism verification ≥98%.
- UI/Runner can roll forward/back via blue/green deployments gated by Phase 8/9.

## Troubleshooting
- **Events missing**: verify SSE gateway uptime and retry interval (3s exponential backoff).
- **Snapshot mismatch**: fetch `reports/snapshot_diff.txt` for root cause.
- **Runner saturation**: scale workers via `helm upgrade --set runner.replicas=...`.
