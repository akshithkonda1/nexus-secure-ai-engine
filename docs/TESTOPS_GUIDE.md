# TestOps Guide — Ryuzen Toron v2.5H+

This guide explains how TestOps coordinates backend, frontend, reporting, and WAR ROOM
flows for Toron v2.5H+. Wave 3 completes wiring, reporting, and bundling.

## How TestOps works
- **Master Runner** orchestrates SIM suite, load testing, replay determinism, and pipeline checks.
- **Reporters** emit JSON + HTML reports with inline SVG charts and snapshot metadata stored per run.
- **WAR ROOM** captures incidents with severity scores and remediation hints, streamable via SSE to the UI.
- **Store/DB** keeps run metadata, snapshots, and WAR ROOM events for later retrieval.
- **Bundle creator** packages every artifact (reports, logs, snapshots, SIM/load/replay summaries) into a deterministic ZIP.

## Running the backend
1. Create a virtual environment and install requirements: `pip install -r testops/backend/requirements.txt`.
2. Start the backend API (FastAPI/Starlette): `uvicorn testops.backend.main:app --reload`.
3. Ensure `testops/backend/db/schema.sql` exists (the app auto-applies it through `MasterStore`).
4. Runs and reports are written to `testops/backend/reports/<run_id>/`.

## Running the frontend
1. From `testops_frontend`, install dependencies: `npm install`.
2. Launch the dev server: `npm run dev` (or the provided start script).
3. The frontend consumes SSE streams for logs, subsystem transitions, and WAR ROOM events.

## Starting a full test
1. Hit the backend endpoint that triggers `MasterRunner.start_run()` (API route `/master/run` in Wave 1/2).
2. Watch progress via SSE stream `/master/stream/{run_id}` for log lines + WAR ROOM events.
3. When the run completes, fetch the summary via `/master/status/{run_id}` and the generated report links.

## Subsystem responsibilities
- **SIM suite**: deterministic simulation validation using curated SIM datasets under `testops/backend/tests_master/sim/`.
- **Load tester**: k6-based load test with deterministic seed derived from the run id.
- **Replay engine**: replays snapshot data to compute determinism scores and drift detection.
- **Pipeline checker**: validates T1/T2/T3 structures, Opus escalations, contradiction density, confidence bounds, and latency anomalies.
- **Reporter**: builds HTML/JSON reports, embeds SVG charts, and surfaces WAR ROOM findings plus subsystem status.
- **Bundle creator**: zips JSON/HTML reports, logs, snapshots, SIM summary, load summary, and replay summary.
- **Store**: writes `result.json`, tracks report/bundle paths, persists snapshots and WAR ROOM events.

## Snapshots
- Stored in `testops/backend/snapshots/<run_id>.json` and mirrored in SQLite `snapshots`.
- Generated after SIM + load stages; replay uses the snapshot to validate determinism.
- Snapshots include run metadata, metrics, and artifact pointers to keep determinism reproducible.

## Determinism
- Replay engine hashes snapshot content to derive a deterministic drift score.
- Determinism score is visualized as a bar in the HTML report and included in JSON payloads.
- Consistency targets: scores ≥90 are PASS, 70–89 WARN, below 70 FAIL triggers WAR ROOM escalation.

## WAR ROOM usage
- Use WAR ROOM to triage anomalies: each event records severity, subsystem, remediation, and score.
- Events stream to the frontend via SSE and are written to `warroom/warroom.log` and SQLite.
- Critical findings are highlighted in the HTML report table and in pipeline notes.

## Debugging failures
- Check `testops/backend/reports/<run_id>/run.log` for stage-by-stage output.
- Review `report.json` and `report.html` for pipeline checker notes and subsystem metrics.
- Inspect `warroom/warroom.log` or the `warroom_events` table for root causes and suggested remediation.
- Re-run with the same `run_id` seed to reproduce deterministic SIM/load outputs.

## Extending TestOps for v3
- Add new subsystems by extending `MasterRunner` to emit module entries and WAR ROOM events.
- Update `reporters/master_reporter.py` to render new metrics/charts; extend the template if needed.
- Evolve the schema in `db/schema.sql` then let `MasterStore` auto-apply it on startup.
- Expand `pipeline_checker.py` with new tier checks and wire results into the reporter payload.

## Upgrading Toron versions safely
- Keep an `engine_path` mapping in `engine_adapter` to point at the desired Toron build.
- Run SIM, load, and replay with the new engine in a staging run; validate determinism and latency thresholds.
- Only promote after PASS/WARN results with no CRITICAL WAR ROOM events.
- Maintain backward-compatible stubs for older Toron releases during the transition window.

## Adding new SIM datasets
- Place datasets under `testops/backend/tests_master/sim/` and register them in `sim_dataset.json`.
- Ensure datasets include deterministic seeds and expected outputs for regression comparison.
- Update `evaluate_sessions` rules to account for new scenarios, then run a full TestOps cycle to validate.
