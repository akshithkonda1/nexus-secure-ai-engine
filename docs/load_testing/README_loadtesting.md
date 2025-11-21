# Ryuzen Load & Stress Testing Suite

This suite runs k6 and Locust scenarios to validate ToronEngine stability, throughput, and latency across SSE/WebSocket and connector-heavy workloads.

## k6 Scenarios
- `k6/load_test.js` — baseline request/response load.
- `k6/stress_test.js` — multi-model debate storm to stress connectors.
- `k6/soak_test.js` — 6-hour endurance with gradual ramp.

Run with:
```bash
cd docs/load_testing/k6
K6_WEB_DASHBOARD=true k6 run load_test.js
```

## Locust Scenarios
- `locustfile.py` orchestrates scenario selection.
- `scenarios/chat_heavy.py` — concurrent chat completions.
- `scenarios/connectors_heavy.py` — connector rotations and health checks.
- `scenarios/telemetry_heavy.py` — telemetry ingestion benchmarks.

Run with:
```bash
cd docs/load_testing/locust
locust -f locustfile.py --headless -u 200 -r 20 -t 10m --host https://api.ryuzen.example.com
```

## Metrics Collected
- Request latency distributions
- Token streaming rate (tokens/s)
- Throughput (requests/s)
- Connector performance and error rate
- Telemetry ingestion speed
- Engine stability and memory/load averages
