# V3 Migration Guide

## Purpose
Provide a complete path to migrate TestOps and Toron v2.5H+ deployments to the v3 architecture with controlled risk.

## Architecture
- Parallel stacks: v2.5H+ (control) and v3 (candidate) deployed side by side.
- Traffic splitter routes synthetic load according to feature flag.
- Snapshot stores isolated per version; Reports compare outputs.

### Migration Diagram
```
[Traffic Splitter]
   |--> [TestOps v2.5H+] -> [Snapshots v2] -> [Reports]
   \--> [TestOps v3]    -> [Snapshots v3] -> [Reports]
                                   \----> [Snapshot Compare]
```

## Component Interaction
1. Traffic splitter directs percentage-based traffic using `TESTOPS_V3_ENABLE`.
2. Both stacks run identical suites; snapshots stored separately.
3. Snapshot compare highlights regressions; decision recorded in Warroom.

## API References
- `POST /v1/deploy/v3-preview` — launch candidate stack.
- `POST /v1/traffic-split` — set A/B percentages.
- `POST /v1/snapshots/compare` — compare v2 vs v3 outputs.

## Key Concepts
- **A/B Testing**: run v2.5H+ (control) alongside v3 (candidate) using feature flags and split traffic.
- **Version Matrix**: maps UI, Runner, Engine, Snapshot schema, and Telemetry policy versions.
- **Regression Suite Logic**: execute regression_core + boundary_conditions across both versions; compare snapshots.

## Migration Steps
1. **Prepare Matrix**: populate `VERSIONING_AND_RELEASE_NOTES.md` with v2.5H+ vs v3 component versions.
2. **Dual Deployment**: deploy v3 as `testops-v3` alongside existing stack; keep snapshots isolated.
3. **A/B Routing**: set 10% of synthetic traffic to v3 via feature flag `TESTOPS_V3_ENABLE=0.1`.
4. **Regression Execution**: run `sim_suite_reference` suites on both versions with same seeds.
5. **Snapshot Compare**: `python tools/snapshot_compare.py --base snapshots/v2 --target snapshots/v3 --strict`.
6. **Gate Evaluation**: ensure determinism ≥98% and no invariant regressions.
7. **Cutover**: increase feature flag to 100% when gates pass; retire v2 after 48h stability.

## Command Examples
- `make deploy-v3-preview`
- `TESTOPS_V3_ENABLE=0.2 make sim-compare`
- `python tools/version_matrix.py --out reports/version_matrix.json`

## Troubleshooting
- **Snapshot schema mismatch**: run migration script `tools/snapshot_migrate_v3.py`.
- **A/B drift**: confirm seeds identical and traffic splitter configured.
- **Regression failures**: prioritize boundary_conditions outputs; rerun with verbose diff.

## Upgrade Paths
- For incremental v3 patches, re-run determinism and regression suites; update matrix.
- For rollback, set `TESTOPS_V3_ENABLE=0` and redirect traffic to v2.5H+ snapshots.

## Versioning Notes
- Maintain compatibility matrix in release notes; include telemetry policy and hash salt versions.
- Tag migration runs with `migration-v3-<date>` and store artifacts in `reports/migration/`.
