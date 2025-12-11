# Simulation Suite Reference

## Purpose
Document the offline simulation suites that validate Toron v2.5H+ behavior under deterministic seeds and controlled variance.

## Architecture
- **Sim Orchestrator**: loads scenarios, seeds RNG, and coordinates execution.
- **Fixture Library**: synthetic datasets, including edge-case and stress fixtures.
- **Metrics Collector**: captures latency, throughput, determinism, and invariant adherence.
- **Report Generator**: produces `sim_report.html` and JSON summaries for CI artifacts.

### Data and Control Flow
```
[Scenario Configs] -> [Orchestrator] -> [Engine Kernels]
                                  \-> [Metrics Collector] -> [Report Generator]
```

## Component Interaction
1. Runner requests a suite execution with profile + seed.
2. Orchestrator binds fixtures and executes Toron kernels.
3. Metrics Collector aggregates determinism and performance; Report Generator produces artifacts.

## API References
- `POST /v1/sim/runs` — start a sim run with suite + seed.
- `GET /v1/sim/runs/{id}/status` — track execution.
- `GET /v1/sim/runs/{id}/report` — fetch `sim_report.html`.

## Suite Index
- **regression_core**: baseline deterministic suite; gate ≥98% determinism.
- **boundary_conditions**: extreme inputs and resource ceilings.
- **failover_paths**: resilience and rollback validation.
- **performance_smoke**: quick throughput/latency guard.
- **compliance_masking**: verifies PII scrubber and quarantine cycle.

## Command Examples
- `python sim/run_suite.py --profile offline --suite regression_core --seed 42`
- `python sim/run_suite.py --suite boundary_conditions --strict`
- `SIM_SEED=99 python sim/run_suite.py --suite failover_paths --report sim_report.html`

## Troubleshooting
- **HTML report missing**: ensure `reports/` exists or pass `--report-path`.
- **Seed drift**: specify `--seed` explicitly and clear `~/.cache/toron`.
- **Unexpected nondeterminism**: check masked fields in `reports/sim/diff_masks.json`.

## Upgrade Paths
- Add new scenarios by extending `sim/scenarios/*.yaml` and referencing in suite config.
- Refresh golden snapshots after kernel changes.
- Update scoring thresholds in CI if performance characteristics change; never lower without security sign-off.

## Versioning Notes
- Each suite versioned independently via `sim/suites/<name>/version.txt`.
- Align suite versions with Toron engine patch releases when invariants change.
