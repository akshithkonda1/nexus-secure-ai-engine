# Snapshot and Replay Guide

## Purpose
Explain how to capture, store, compare, and replay snapshots for Toron v2.5H+ within TestOps.

## Architecture
- **Snapshot Writer**: serializes deterministic outputs with metadata (seed, suite, version).
- **Snapshot Store**: file/PVC storage under `snapshots/`.
- **Replay Engine**: rehydrates snapshots and runs invariant checks.
- **Diff Analyzer**: computes deltas and produces human-readable reports.

### Flow
```
[Engine Output] -> [Snapshot Writer] -> [Snapshot Store]
                            |                 |
                     [Diff Analyzer]     [Replay Engine]
```

## Component Interaction
1. Runner requests snapshot capture post-suite completion.
2. Snapshot Writer stores data and metadata; Snapshot Store retains versions.
3. Diff Analyzer compares against golden baselines; Replay Engine validates behavior.

## API References
- `POST /v1/snapshots` — capture snapshot for a run-id.
- `POST /v1/snapshots/compare` — diff current vs golden.
- `POST /v1/snapshots/replay` — replay snapshot with provided seed.

## Command Examples
- Capture: `python tools/snapshot_capture.py --run-id <id> --output snapshots/<id>.tar.gz`.
- Compare: `python tools/snapshot_compare.py --base snapshots/golden --target snapshots/<id>`.
- Replay: `python tools/snapshot_replay.py --run-id <id> --seed 42 --offline`.

## Troubleshooting
- **Replay failure**: verify matching engine version; use `--force-downgrade` only in labs.
- **Diff noise**: ensure diff masks up to date; check `diff_masks.json`.
- **Storage pressure**: prune with `tools/snapshot_gc.py --keep 10`.

## Upgrade Paths
- On engine upgrade, regenerate golden snapshots and re-run determinism gate.
- Maintain migration scripts to convert old snapshot schemas to v3 (see V3_MIGRATION_GUIDE.md).

## Versioning Notes
- Snapshot schema version tracked in metadata; CI checks for mismatches in `snapshot-compare` job.
