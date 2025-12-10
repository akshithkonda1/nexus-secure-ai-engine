# Ryuzen Toron v2.5H+ Testing Ecosystem

This document summarizes the synthetic, offline-friendly testing control panel introduced for Toron v2.5H+.

## Components
- **FastAPI control plane** (`src/backend/toron_v25hplus`): exposes SIM, load, telemetry, engine validation, snapshot, and metrics endpoints.
- **SQLite persistence** (`src/backend/toron_v25hplus/store.py`): tracks test runs, SIM results, load runs, snapshots, and war-room events.
- **Front-end control panel** (`Frontend/src/pages/control-panel`): Vite/React/Tailwind dashboard with runnable tests and live telemetry visualizations.
- **SIM and telemetry stubs** (`ryuzen/toron_v25hplus/sim_suite.py`, `ryuzen/toron_v25hplus/telemetry_stub.py`): deterministic helpers for synthetic execution.

## Endpoint surface
The FastAPI router binds directly into the existing app and serves the following JSON endpoints:

- `POST /tests/sim/run|batch|full|stress|replay`
- `POST /tests/load/run|custom`
- `POST /tests/telemetry/scrub` and `POST /tests/telemetry/quarantine`
- `POST /tests/engine/tier|mal|determinism|snapshot-validate`
- `GET /tests/history`, `GET /tests/snapshots`, `GET /tests/snapshot/{id}`, `POST /tests/snapshot/diff`
- `GET /metrics/live`, `GET /metrics/stability`, `GET /metrics/load/{run_id}`, `GET /metrics/war-room`

## Running locally
1. Install dependencies: `pip install -r requirements-dev.txt`
2. Start the server: `python src/backend/server.py`
3. Start the front-end: `cd Frontend && npm install && npm run dev`
4. Open the control panel routes under `/control/dashboard`, `/control/run`, `/control/test-history`, `/control/snapshots`, `/control/load`, `/control/stability`, `/control/war-room`, and `/control/replay`.

All data is synthetic and deterministic—no external network calls are required.
