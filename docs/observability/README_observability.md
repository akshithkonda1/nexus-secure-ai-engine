# Observability Stack

This directory packages Grafana dashboards, Prometheus alert rules, and OpenTelemetry collector configuration for Ryuzen Toron v1.6.

## Components
- **Grafana Dashboards**: Overview, model performance, and connector health dashboards with SSE/WebSocket throughput panels.
- **Prometheus Rules**: Alert definitions for engine latency, connector failures, model drift, rate limit pressure, and memory pressure.
- **OpenTelemetry Collector**: Collects traces/metrics/logs and exports to OTLP-compatible backends. Telemetry redaction removes PII attributes by default.

## Deployment
1. Deploy Prometheus with the included `prometheus_rules/ryuzen_alerts.yaml` as an additional rule file.
2. Import the JSON dashboards in `grafana_dashboards/` to Grafana (v9+ recommended).
3. Deploy the OTEL Collector using `otel/otel-config.yaml` as a sidecar or DaemonSet. Point exporters to your OTLP endpoint.
4. Ensure application pods expose `/metrics` and OTLP gRPC/HTTP endpoints for scraping.

## Key Metrics
- **Pod CPU/Memory/Disk**: `container_cpu_usage_seconds_total`, `container_memory_working_set_bytes`, and kubelet volume metrics.
- **FastAPI Latency**: Histogram `toron_request_latency_seconds` labeled by route and status.
- **SSE/WebSocket Throughput**: Custom `toron_stream_tokens_total` and connection gauges.
- **Model Latency**: `toron_model_latency_seconds_bucket` per connector/model.
- **Connector Sync Duration**: `toron_connector_sync_seconds_bucket` with status labels.
- **Telemetry Ingestion Rate**: `toron_telemetry_ingest_total` / `toron_telemetry_ingest_seconds_count`.
- **Engine Health Score**: `toron_engine_health_score` gauge from aggregated signals.

## Traces
ToronEngine emits spans for:
- `ToronEngine.process` — core inference pipeline with child spans per model call.
- `connector.sync` — scheduled sync jobs with provider labels.
- `cloud.call` — outbound cloud provider API calls.

## Logs and Redaction
- Sensitive attributes (`api_key`, `user_email`, `token`) are dropped at the collector using attribute filters.
- Sampling defaults to 1:1 for production; adjust `tail_sampling` policies if volume requires.
