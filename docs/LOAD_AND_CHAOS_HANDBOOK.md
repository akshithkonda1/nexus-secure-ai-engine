# Load and Chaos Handbook

## Purpose
Define how to execute and interpret load and chaos experiments for TestOps and Toron v2.5H+ in offline, deterministic conditions.

## Architecture
- **Chaos Controller**: orchestrates fault injection (network jitter, pod restarts) using synthetic toggles.
- **Load Generator**: k6 in mock mode with seeded scenarios.
- **Metrics Sink**: writes to `reports/load/` and `reports/chaos/`.
- **Recovery Monitor**: verifies auto-heal and SSE reconnect behavior.

### Flow Diagram
```
[Scenarios] -> [Chaos Controller] -> [Runner] -> [Engine]
                      |                   |
                [Load Generator]     [Metrics Sink]
                      |                   |
                      +--------> [Reports] <-------+
```

## Component Interaction
1. Runner schedules load + chaos suites with shared seeds.
2. Chaos Controller injects failures while Load Generator drives traffic.
3. Metrics Sink captures latency/error/determinism; Reports emitted for CI.

## API References
- `POST /v1/chaos/run` — start chaos suite with seed.
- `POST /v1/load/run` — run k6 mock scenarios.
- `GET /v1/load/{id}/report` — retrieve `load_profiles.json`.

## Command Examples
- `make chaos-smoke MODE=mock` — quick chaos smoke.
- `k6 run load/mock_scenarios.js --out json=reports/load/load_profiles.json`.
- `python tools/chaos_runner.py --profile offline --seed 7 --recover-check`.

## Troubleshooting
- **High error rate**: inspect `reports/load/load_profiles.json` for hotspots; lower VUs and retest.
- **Stuck recovery**: check Runner logs and Warroom incidents for rollback triggers.
- **Nondeterministic chaos results**: enforce `CHAOS_SEED` and disable entropy tokens in diffs.

## Upgrade Paths
- Add new chaos primitives in `tools/chaos_primitives.py` and document SLOs.
- Expand k6 scenarios to cover new APIs; keep mock data offline.

## Versioning Notes
- Tag scenarios with `v<major>.<minor>` inside `load/mock_scenarios.js` header.
- Align chaos primitives with Toron engine patch level to ensure invariant coverage.
