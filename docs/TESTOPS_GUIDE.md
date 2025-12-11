# TestOps Guide

## Architecture Overview
The TestOps backend is organized around deterministic test execution with three major surfaces:

- **Simulation Suite (`testops_backend/sim`)**: runs synthetic Toron pipeline calls entirely offline with deterministic seeds and produces latency maps, contradiction maps, and HTML/JSON summaries.
- **Load Suite (`testops_backend/load`)**: orchestrates k6 profiles for baseline (1,500 VUs) and stress (10,000 VUs) runs and stores req/sec, p95, p99, and failure rates.
- **Replay & War Room (`testops_backend/replay`, `testops_backend/warroom`)**: reloads snapshots for byte-for-byte determinism checks and captures anomaly logs plus remediation guidance.

Shared configuration lives in `testops_backend/core/config.py` which also provisions directories for logs, reports, snapshots, and war room artifacts.

## Running the Backend
1. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the API (from repository root):
   ```bash
   uvicorn testops_backend.main:app --reload
   ```
3. Logs, reports, and snapshots are emitted under `testops_backend/logs/master`, `testops_backend/reports/master`, and `testops_backend/snapshots` respectively.

## Running the Frontend
1. Install dependencies:
   ```bash
   cd testops_frontend
   npm install
   npm run dev
   ```
2. Ensure the backend is reachable; update any proxy settings in the frontend `.env` if needed.

## Wiring New Toron Versions
1. Update the Toron client configuration used by the backend under `toron/` and confirm any new endpoints in `testops_config.yaml`.
2. Refresh the simulation dataset (`testops_backend/sim/sim_dataset.json`) with prompts that exercise the new behaviors.
3. If deterministic seeds need to change, set the `SIM_SEED` environment variable or edit `testops_backend/sim/sim_config.yaml`.
4. Re-run the SIM suite (see below) to validate deterministic outputs before enabling the version in production configs.

## Running SIM Test
Use the offline simulation runner to exercise the full Toron pipeline:
```bash
python -c "from testops_backend.sim.sim_runner import run_full_suite; print(run_full_suite())"
```
Outputs:
- JSON and HTML reports under `testops_backend/reports/master`.
- Latency maps, tier failures, contradiction maps, confidence distribution, and determinism baseline snapshots under `testops_backend/snapshots`.
- Use `testops_backend/sim/sim_replay.py` to reload snapshots for debugging.

## Running Load Test
1. Generate the baseline k6 script (1,500 VUs, 30 req/sec for 2m):
   ```bash
   python -c "from testops_backend.load.k6_runner import run_k6; print(run_k6())"
   ```
2. Run the stress profile (10,000 VUs) by passing the stress profile:
   ```bash
   python -c "from testops_backend.load.k6_generator import build_profile; from testops_backend.load.k6_runner import run_k6; print(run_k6(build_profile('stress')))"
   ```
If k6 is unavailable, synthetic deterministic metrics are returned. Otherwise, k6 writes its summary JSON to `testops_backend/load/` and metrics are parsed for p95, p99, req/sec, and failure rate.

## Running Determinism Test (Replay)
1. Ensure a simulation snapshot exists (created by the SIM test).
2. Replay using the same seed:
   ```bash
   python -c "from testops_backend.replay.replay_engine import replay; print(replay('toron_sim_suite'))"
   ```
3. The replay engine reloads the snapshot, regenerates deterministic fingerprints, and reports byte-for-byte match scores and determinism scores.

## Running the Full Test Suite
1. Execute the SIM suite to generate snapshots and reports.
2. Run the baseline and stress k6 profiles to collect load metrics.
3. Replay determinism to verify reproducibility.
4. Use `testops_backend/reports/report_builder.py` and `testops_backend/reports/bundle_generator.py` to create an HTML summary and a bundle zip:
   ```bash
   python -c "from testops_backend.reports.report_builder import build_html_report, build_json_report; from testops_backend.reports.bundle_generator import build_bundle; html=build_html_report({'status':'ok'}); json_path=build_json_report({'status':'ok'}); print(build_bundle(html, {'status':'ok'}))"
   ```

## Interpreting Artifacts
- **Snapshots** (`testops_backend/snapshots/*_snapshot.json`): deterministic records of latency maps, contradictions, and confidence distributions. Use these for replay comparisons.
- **WAR ROOM logs** (`testops_backend/warroom/master/warroom.log`): newline-delimited JSON entries with anomaly kinds and remediation hints. Analyze with `testops_backend/warroom/warroom_analyzer.py`.
- **Latency maps**: per-tier latency vectors in SIM reports. High values over the configured budgets indicate tier failures.
- **Load reports**: p95/p99 and failure rates are stored in k6 summaries; stress mode is labeled as extended.

## Extending for v3
- Add new Toron tiers or behaviors by extending `sim_dataset.json` and adjusting latency budgets in `sim_config.yaml`.
- Update the war room remediation dictionary in `warroom_analyzer.py` to include new instability types.
- Expand the HTML template in `testops_backend/reports/html_template.html` with additional sections for any new metrics introduced by v3.
- Keep seeds deterministic by updating `testops_backend/sim/sim_seed.py` and replay fingerprints whenever payload structures change.
