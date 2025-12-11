# TestOps Section 2 Guide (Ryuzen Toron v2.5H+)

## Purpose
Section 2 introduces a streamlined orchestration stack for deterministic validation, load checks, and replay guarantees. It complements the existing TestOps surface with focused endpoints for running the SIM suite, issuing k6 load profiles, and validating determinism through replayed snapshots.

## Components
- **Master Runner** (`testops/backend/runners/master_runner.py`): creates `run_id`, orchestrates SIM + k6 + replay, streams logs via SSE, and writes snapshots under `testops/snapshots/`.
- **Test Router** (`testops/backend/routers/test_router.py`): FastAPI router exposing `/run`, `/status/{run_id}`, `/stream/{run_id}`, and `/result/{run_id}`.
- **Replay Engine** (`testops/backend/replay/replay_engine.py`): replays snapshots and produces `determinism_score`.
- **Warroom Logger** (`testops/backend/warroom/warroom_logger.py`): structured error logging for incident triage.
- **DB Schema** (`testops/backend/db/schema.sql`): canonical tables for persisting run metadata and event history.

## Activation Flow
1. Call `/begin` to unlock testing (existing main application behavior).
2. POST `/tests/run` (or `/tests/run_all` for legacy master) to start a Section 2 run.
3. Subscribe to `/tests/stream/{run_id}` for live logs; poll `/tests/status/{run_id}` for status JSON.
4. Fetch `/tests/result/{run_id}` to retrieve aggregated data, including replay scores and snapshot location.

## Snapshot + Determinism
- Snapshots live in `testops/snapshots/` and contain SIM metrics, k6 metrics, and trigger metadata.
- `ReplayEngine.validate` computes a deterministic hash-based score and flags drift if below the target floor (default 90).
- Snapshots can be replayed offline by loading the JSON and passing it into `ReplayEngine.validate(snapshot)`.

## Adding New Checks
- Extend `MasterRunner._execute` with new phases. Ensure progress increments and log entries are added so SSE subscribers see updates.
- Persist any new artifacts by adding them to the snapshot payload before writing to disk.
- If a check can fail deterministically, emit a warroom log with a remediation suggestion to keep triage consistent.
