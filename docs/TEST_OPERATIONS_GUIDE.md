# Ryuzen Toron v2.5H+ — Test Operations Guide

This guide explains how to run the backend, launch the frontend test dashboard, trigger the full test suite, and interpret the outputs. Everything runs with Python 3.11 and Node 18+.

## Running the backend

1. Install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Start the FastAPI service:
   ```bash
   uvicorn backend.main:app --reload --port 8088
   ```
3. Required directories are created automatically under `backend/` (logs, reports, load results, war room, snapshots).

## Running the frontend

1. Install Node dependencies:
   ```bash
   cd frontend-testdash
   npm install
   ```
2. Launch the Vite dev server:
   ```bash
   npm run dev -- --host --port 5173
   ```
3. Set `VITE_TESTOPS_API` to the backend URL if different from `http://localhost:8088`.

## Triggering the full test suite

1. Open the dashboard at `http://localhost:5173`.
2. Wait for the **Engine validated** banner to show ✅.
3. Type **exactly** `Begin testing` in the confirmation box.
4. Click **RUN FULL TEST SUITE**.
5. Live logs stream via SSE; status bubbles show SIM Batch, Engine Check, Replay, and Load Test states.

## Reading logs

- Live logs stream from `backend/warroom/master/{run_id}.log`.
- All failures are indexed in `backend/warroom/master/index.json` and surfaced on the War Room page.

## Reading snapshots

- Snapshots are written to `backend/snapshots/state_snapshot.json`.
- Each run bundles a text-only archive at `backend/snapshots/{run_id}_bundle.zip`.

## Verifying determinism

- The replay engine loads `state_snapshot.json` and compares outputs; status appears under the Replay bubble.
- Determinism scores from the SIM batch surface in the dashboard summary metrics and the HTML report.

## Interpreting ASCII metrics

- SIM latency and confidence trends are rendered as ASCII bar lines in `backend/reports/master/{run_id}.html`.
- Higher density blocks (█) indicate higher values; empty or light symbols show lower values.

## War Room triage

- All errors funnel through `WarRoomLogger`, which writes severity-tagged entries.
- The War Room page sorts by severity and timestamp using `backend/warroom/master/index.json`.
- Critical or high-severity entries should be addressed before re-running the suite.

## Engine Wiring & Upgrades (Toron v2.5H → v3+)

The engine is configured through the `ENGINE_PATH` environment variable or `testops_config.yaml` entry:

```yaml
ENGINE_PATH: "ryuzen.engine.toron_v25hplus.ToronEngine"
```

To migrate to a new engine version (e.g., Toron v3):

1. Implement the new engine class (e.g., `ryuzen.engine.toron_v3.ToronEngineV3`).
2. Ensure it exposes at least one of: `process(prompt: str)`, `run(prompt: str)`, `handle_request(prompt: str)`, or `execute(prompt: str)`.
3. Update `ENGINE_PATH` to the new dotted path.
4. Run the TestOps frontend and use **Engine Validation** via `/tests/validate_engine`.
5. Proceed only when validation shows ✅, then type **Begin testing** and start the suite.

### Engine Validation Flow

- User opens TestOps Dashboard
- TestOps calls `/tests/validate_engine`
- If OK → green banner
- User types `Begin testing`
- User clicks “RUN FULL TEST SUITE”
- SSE stream + status view display progress

## Extending TestOps

- **v3 (multi-cloud):** add cloud-specific runners and extend `MasterRunner` to dispatch per-cloud workloads; store artifacts under `backend/reports/{cloud}`.
- **v4 (cross-cluster testing):** introduce cluster selectors and orchestrate sequential runs per cluster; aggregate cluster snapshots before bundle creation.
- **v5 (full LLM fleet orchestration):** plug fleet metadata into `engine_loader`, shard fuzzers per model, and fan-in reports for a fleet-level determinism score.
