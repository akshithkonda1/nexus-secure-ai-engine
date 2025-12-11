# Ryuzen Toron v2.5H+ TestOps Guide

## Overview
This document describes the isolated TestOps harness for the Ryuzen Toron v2.5H+ Engine. The harness provides backend FastAPI services, a dedicated frontend dashboard, and offline synthetic suites for SIM, hardening phases 4–9, replay validation, and beta readiness.

## Running the backend
1. Navigate to `testops/backend`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Start the API: `uvicorn testops.backend.main:app --reload --port 8000`.
4. Required directories (created automatically):
   - `backend/logs/master`
   - `backend/reports/master`
   - `backend/snapshots`
   - `backend/warroom/master`
   - `backend/database`

## Running the frontend dashboard
1. Navigate to `testops/frontend-testdash`.
2. Install dependencies: `npm install`.
3. Run the Vite dev server: `npm run dev -- --host --port 4173`.
4. The dashboard communicates only with the TestOps backend endpoints exposed under `/tests/*` and `/testops/run`.

## Integrating new Toron versions
- Update `tests_master/engine_validator.py` to encode the new configuration signature.
- Extend `tests_master/v3_migration` with additional migration checks and update `version_matrix.json` accordingly.
- Ensure new modules expose a `run_tests(run_id)` function so they are auto-discovered by `master_runner.py`.

## Snapshot replay
- Snapshots are written to `backend/snapshots/{run_id}.json` via `master_reporter.build_snapshot`.
- `sim/sim_replay.py` revalidates determinism by comparing synthesized traces across runs.
- Replay logs are added to `warroom/master/{run_id}.log` for auditability.

## Determinism calculation
- SIM determinism is derived from `sim/sim_assertions.py` by validating prompts against expected outputs.
- Replay determinism (`determinism_score`) is reported in the replay phase metrics.
- CDG integrity is checked in `engine_hardening/cdg_integrity_checker.py`.

## Report structure
Each run produces:
- HTML report: `reports/master/report_{run_id}.html`
- JSON summary: `reports/master/report_{run_id}.json`
- Snapshot: `snapshots/{run_id}.json`
- WAR ROOM log: `warroom/master/{run_id}.log`

Reports include latency and chaos notes, readiness meters (public beta, controlled beta, determinism, PII), and a module matrix with PASS/FAIL status.

## WAR ROOM logs
- Collected per run in `warroom/master/{run_id}.log`.
- Populated via the same log feed used for SSE streaming.
- Intended for coordination during incident-style reviews of synthetic failures.

## Onboarding new models
- Add new deterministic SIM cases to `sim/sim_dataset.json` and `sim/generator.py`.
- Add PII and safety validations to `security_hardening` modules as needed.
- Keep changes offline and deterministic; avoid external calls.

## PII compliance
- `security_hardening/pii_scrubber_tester.py` asserts scrubber coverage for names, emails, phones, IPs, and related metadata.
- `telemetry_quarantine_tester.py` ensures sensitive telemetry is quarantined with checksum validation.

## Chaos testing
- Load and chaos operations are mocked via `load_and_chaos` modules.
- To run manually, trigger `/tests/run_all` or `/testops/run` after unlocking the backend with the exact phrase `Begin testing`.

## Extending for Toron v3
- Add new migration scenarios under `v3_migration/`.
- Update `engine_validator.py` to reflect v3 readiness gates.
- Incorporate additional beta/public readiness modules; they will be auto-discovered by `master_runner.py`.
