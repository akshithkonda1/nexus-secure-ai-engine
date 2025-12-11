# Toron v2.5H+ Engine Validation Guide

## Purpose
Provide authoritative validation procedures for Toron v2.5H+ to guarantee deterministic execution, safety, and compliance within TestOps.

## Architecture
- **Kernel Executors**: deterministic compute units with seed control.
- **Scenario Loader**: feeds synthetic datasets into kernels; supports A/B fixtures.
- **Validator**: asserts output invariants and stability windows.
- **Snapshot Writer**: captures state deltas and metadata for replay.
- **Telemetry Hooks**: sanitized metrics (PII-scrubbed) emitted to telemetry buffer.

### Engine Validation Flow
```
[Fixtures] -> [Scenario Loader] -> [Kernel Executors] -> [Validator]
                                         |                 |
                                   [Snapshots]        [Reports]
```

## Components Interaction
1. Runner invokes engine via `python backend/ryuzen/engine/toron_v25hplus.py --profile offline`.
2. Scenario Loader binds synthetic dataset, seeds deterministic RNG.
3. Kernel Executors run; Validator enforces invariants (latency p95, drift tolerance, safety rails).
4. Snapshot Writer persists outputs; Reports capture determinism (% match) and coverage.

## API References
- `toron_v25hplus.validate(profile: str, seed: int, strict: bool)`
- `toron_v25hplus.snapshot(run_id: str)`
- `toron_v25hplus.compare(base: str, target: str)`

## Command Examples
- `python backend/ryuzen/engine/toron_v25hplus.py --validate --profile offline --seed 42`
- `python backend/ryuzen/engine/toron_v25hplus.py --snapshot --run-id run-123`
- `python backend/ryuzen/engine/toron_v25hplus.py --compare --base main --target feature`

## Determinism Policy
- Determinism gate: ≥98% exact match across snapshots.
- Allowed nondeterminism zones: timestamps and entropy tokens must be masked before diff.
- Enforce `SIM_SEED` per run; log seeds in `reports/determinism.json`.

## Troubleshooting
- **Drift**: inspect `reports/snapshot_diff.txt`; re-run with `--seed 42`.
- **Performance regression**: check `reports/perf_profile.json` against thresholds.
- **Snapshot write failure**: ensure `snapshots/` volume mounted RW.

## Upgrade Paths
- For minor changes, refresh snapshots and validate determinism.
- For kernel rewrites, run extended sim-suite and hardening (Phases 4–7) before merge.
- When upgrading dependencies, regenerate Pydantic models and re-run regression suite.

## Versioning Notes
- Tag engine builds as `toron-v2.5H+.<patch>`.
- Maintain compatibility matrix in `VERSIONING_AND_RELEASE_NOTES.md` mapping engine to TestOps versions.
