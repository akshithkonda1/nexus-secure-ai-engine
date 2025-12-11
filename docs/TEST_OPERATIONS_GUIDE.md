# TestOps System for Ryuzen Toron v2.5H+

## Overview
TestOps is the standalone DevOps testing platform for Toron v2.5H+. It validates the engine, executes SIM batches up to 10,000 simulated users, drives k6 load tests, performs determinism replays, and produces HTML/JSON reports with centralized logs and snapshots. The FastAPI backend and Vite + React frontend run independently of the consumer UI.

## Running the backend
1. Ensure Python 3.11 is available.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn jinja2
   ```
3. Start the service:
   ```bash
   uvicorn testops_backend.main:app --reload --port 8000
   ```
4. The SQLite database is stored at `testops_backend/database/tests_master.db` and is initialized automatically.

## Running the frontend
1. Install Node.js 18+.
2. From `testops_frontend`, install packages and start Vite:
   ```bash
   npm install
   npm run dev -- --host --port 4173
   ```
3. Access the dashboard at `http://localhost:4173`.

## Beginning a test
1. Open the dashboard and type **BEGIN TESTING** in the unlock field.
2. Click **RUN FULL TEST SUITE**. The button disables while the orchestrator runs.
3. Watch live logs via Server-Sent Events. Status bubbles reflect SIM Batch, Engine Check, Replay, and Load Test phases.
4. Progress and final summaries update automatically; report and bundle buttons become active once results are ready.

## Status bubbles
- **SIM Batch**: Offline simulation of Toron reasoning tiers across up to 10k synthetic users.
- **Engine Check**: Direct import and ping of `ryuzen.engine.toron_v25hplus.ToronEngine`.
- **Replay**: Snapshot replay and checksum verification for determinism.
- **Load Test**: k6-driven load generation (baseline 1,500 VUs, max 10,000).

## Report generation
Master reports are rendered to `testops_backend/reports/master/` as both JSON and HTML. They include latency heatmaps, tier distribution, contradiction counts, Opus escalation frequency, determinism scores, and aggregated metrics. Additional k6 and SIM artifacts are stored alongside the master report.

## Determinism pipeline
Snapshots are written to `testops_backend/snapshots/` for every run. The replay engine reloads these snapshots, replays the pipeline, and checks byte-for-byte payload equality plus checksum scoring to guarantee deterministic behavior.

## Wiring new engine versions
Update `tests_master/pipeline_checker.py` to import the new engine path and adjust any validation prompts. TestOps keeps the rest of the pipeline stable so newer engines can be validated without frontend changes.

## Snapshot validation
Each run writes a snapshot JSON file containing dataset hashes and scale parameters. The replay engine recomputes a checksum to ensure the replay matches the original SIM execution exactly.

## Scaling SIM batches to 10k
`sim_config.yaml` sets a 10,000 user ceiling. The SIM runner respects this limit and derives deterministic metrics from the dataset and run identifier, ensuring stable results while exercising scaling logic.

## WAR ROOM operations
War room logs are mirrored under `testops_backend/warroom/master/` for incident triage. The master runner logs each phase, and the war room file aggregates key events for a single run.

## CI/CD integration
Trigger `/tests/run_all` during pipeline stages to validate Toron deployments. Collect artifacts from `/tests/report/{run_id}` and `/tests/bundle/{run_id}` for archiving. SQLite history enables promotion checks across environments.

## Safe upgrades
- Keep FastAPI and Vite dependencies pinned as declared.
- Run backend and frontend locally after dependency updates.
- Validate engine import paths in `pipeline_checker.py` before deployment.
- Confirm reports and snapshots are emitted to the expected directories to preserve deterministic behavior.
