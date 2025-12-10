# Toron v2.5H+ SIM Load Suite (Enterprise)

This suite bundles the upgraded k6 load profile, war-room telemetry helpers, and frontend prompt references requested for the Toron v2.5H+ simulation environment.

## K6 Stress Profile (1500 VUs @ 30 RPS)

The canonical script lives at `tests/load/k6_test.js` and targets 30 requests per second for two minutes with 1,500 pre-allocated virtual users and a p95 latency objective under 800ms. Override the target URL with the `TORON_TARGET_URL` environment variable when running k6.

```bash
TORON_TARGET_URL=https://your-ryuzen-endpoint/api/toron k6 run tests/load/k6_test.js
```

## War-Room Logger & Summary

`sim/war_room_report.py` provides an append-only JSONL logger (`WarRoomLogger`) and a summary generator (`WarRoomReporter`). The reporter writes `sim/war_room_summary.json`, which the monitoring dashboard can consume for rapid incident triage.

## Frontend Monitoring Inputs

The simulator dashboard is expected to consume:

- `GET /sim/metrics.json` — simulator metrics (RPS, latency, errors, Opus escalations, etc.)
- `GET /sim/war_room_summary.json` — the summary emitted by `WarRoomReporter`

## Master Codex Prompt

```
You are generating the COMPLETE SIMULATION + LOAD + CI SUITE for Ryuzen Toron v2.5H+.

Include ALL of the following:

1. Fix patches for toron_v25hplus.py and MAL retry logic
2. Full SIM Test Suite (sim/)
3. Synthetic dataset generator
4. SIM Runner, Assertions, Reporter, Replay
5. War-Room logger + summary generator
6. K6 Load Testing Script
7. Frontend Dashboard (React+Vite+Tailwind)
8. CI/CD pipeline (GitHub Actions)
9. Unit + Integration + Stability tests
10. Deterministic snapshot hashing
11. Telemetry stub for PII removal simulation

Load Test Requirements:
- 1500 VUs
- 30 RPS
- 2-minute duration
- 95th percentile < 800ms

All code must be:
- runnable
- synthetic
- deterministic
- offline
- fully modular
- CI-safe

END OF SPEC
```

Use this prompt to bootstrap downstream automation or generation tasks.
