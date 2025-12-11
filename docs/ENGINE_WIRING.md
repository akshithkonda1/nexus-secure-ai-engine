# Engine Wiring — Ryuzen Toron v2.5H+

This document explains how TestOps imports and validates the Toron engine for Wave 3.

## Importing Toron
- Engine adapters live under `testops/backend/engine_adapter/`.
- The adapter exposes a stable function (Wave 1) that TestOps calls before SIM/load/replay.
- `engine_path` should point to the Toron build (container volume or local path). Keep it relative when possible.

## Updating `engine_path`
- Edit the adapter configuration to reference the new binary or service URL.
- For containerized deployments, mount the new engine into the backend image and update the path in config.
- Persist the chosen path in config maps or environment variables so pipelines remain deterministic.

## Supporting new Toron versions
- Add version gating in the adapter to branch behavior per Toron release.
- Keep backward-compatible shims so older snapshots still replay correctly.
- Update `pipeline_checker` expectations if new tiers or evidence formats appear in future Toron drops.

## Offline simulation stubs
- Provide a stub engine implementation in the adapter that mirrors expected responses for SIM/load tests.
- Guard usage with a feature flag or environment variable (e.g., `TORON_OFFLINE=1`).
- Use deterministic seeds so SIM snapshots and replay scores remain reproducible offline.

## Engine validation flow
1. Adapter loads the engine handle or HTTP target and performs a health check.
2. SIM suite invokes deterministic scenarios; failures trigger WAR ROOM events and mark subsystem WARN/FAIL.
3. Load tester calls the engine health endpoint during k6 execution; p95/p99 are tracked for anomalies.
4. Replay determinism reuses the adapter to assert consistent outputs from stored snapshots.

## Deterministic snapshot generation
- Snapshots capture the engine version, configuration, SIM metrics, load metrics, and replay details.
- Stored in `testops/backend/snapshots/<run_id>.json` and zipped in `reports/<run_id>/bundle.zip`.
- Use the same adapter entry points during replay to ensure inputs and outputs match across runs.
