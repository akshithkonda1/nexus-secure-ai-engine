# Ryuzen Toron v2.5H+ — Test Operations Guide

This guide explains how to run the full TestOps stack (backend orchestration, frontend dashboard, and validation utilities) and how to interpret the outputs for phases 4–9 of the Ryuzen Toron v2.5H+ Test Operations Suite.

## Backend — How to Run

1. Ensure Python 3.11 is available.
2. Install dependencies (FastAPI + uvicorn + optional dev tools):
   ```bash
   python -m pip install --upgrade pip
   python -m pip install fastapi uvicorn
   ```
3. Start the backend API (default port 8088):
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8088
   ```
4. Required directories are auto-created on startup: `logs/master`, `reports/master`, `load_results`, `warroom/master`, `snapshots`, and `database`.

## Frontend — How to Run

1. Install Node 18+.
2. Install dependencies:
   ```bash
   cd frontend-testdash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev -- --host --port 5173
   ```
4. Set `VITE_TESTOPS_API` if the backend is not on `http://localhost:8088`.

## Triggering the Full Test Suite

1. Open the dashboard at `http://localhost:5173`.
2. Wait for the **Engine Validation** banner to show ✅.
3. Type exactly `Begin testing` in the unlock field.
4. Click **RUN FULL TEST SUITE**. The backend starts SIM, pipeline validation, fuzzer, snapshot + replay, k6 load, and report generation. Live logs stream via SSE.

## Reading Logs and War Room

- Live console (dashboard) streams from `warroom/master/{run_id}.log` via SSE.
- War Room page aggregates all warroom events from the database and log files, sorted by severity and timestamp.
- The logger records severity-coded lines: `[timestamp] [SEVERITY] message`.

## Snapshots and Determinism

- Snapshots are saved to `snapshots/state_snapshot.json` and bundled into `snapshots/bundle.zip`.
- Deterministic replay uses `/tests/replay` pipeline internally to compare byte-for-byte hashes. A mismatch marks the run as failed.
- To manually verify:
  ```bash
  python - <<'PY'
  from backend.tests_master.snapshot_saver import save_snapshot
  from backend.tests_master.replay_engine import replay_snapshot
  payload = {"probe": "determinism", "seed": 42}
  paths = save_snapshot("manual", payload)
  result = replay_snapshot("manual", paths["snapshot_path"])
  print(result)
  PY
  ```
- CI fails if any snapshot content changes between two consecutive saves in the same job.

## ASCII Metrics Interpretation

- Reports (`reports/master/{run_id}.html`) include ASCII bar traces:
  - **Latency Trace:** derived from SIM latency averages and p95.
  - **Confidence Trace:** confidence scores bucketed into ASCII bars.
- Higher bars use `█`; lower values use `▁`. This keeps the report image-free and deterministic.

## War Room Triage Flow

1. Check War Room page for CRITICAL or ERROR entries.
2. Open the corresponding run’s details to view report + metrics.
3. Cross-check snapshot determinism and pipeline checks (tier transitions, MAL health, CDG correctness).
4. Export the bundled snapshot (`snapshots/bundle.zip`) for deeper offline inspection if needed.

## Engine Wiring & Upgrades (Toron v2.5H → v3+)

The engine is configured via `testops_config.yaml`:

```yaml
ENGINE_PATH: "ryuzen.engine.toron_v25hplus.ToronEngine"
```

To migrate to a new engine version (e.g., Toron v3):

1. Implement the new engine class (e.g., `ryuzen.engine.toron_v3.ToronEngineV3`).
2. Ensure it exposes at least one of:
   - `process(prompt: str)`
   - `run(prompt: str)`
   - `handle_request(prompt: str)`
   - `execute(prompt: str)`
3. Update `ENGINE_PATH` to the new dotted path.
4. Run the TestOps frontend and use **Engine Validation** (hits `/tests/validate_engine`). Confirm ✅ before running SIM or load tests.
5. After successful validation, type **“Begin testing”** and press **RUN FULL TEST SUITE**.

### Engine Validation Flow

- User opens TestOps Dashboard
- Dashboard calls `/tests/validate_engine`
- If OK → green banner
- User types `Begin testing`
- User clicks **RUN FULL TEST SUITE**
- SSE stream + status view display progress

## Extending TestOps Roadmap

- **v3 (multi-cloud):** add region-aware runners and store cloud/region metadata in snapshots; extend War Room to group by region.
- **v4 (cross-cluster testing):** coordinate multiple `MasterRunner` instances and aggregate deterministic seeds per cluster; ensure bundle.zip includes per-cluster traces.
- **v5 (full LLM fleet orchestration):** integrate fleet schedulers, per-model health signals, and multi-engine validation before running SIM/load tests.

