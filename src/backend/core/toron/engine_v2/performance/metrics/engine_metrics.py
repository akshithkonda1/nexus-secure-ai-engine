"""Prometheus-compatible engine metrics."""

from prometheus_client import Counter, Histogram


REQUEST_TOTAL = Counter("toron_requests_total", "Total requests processed")
REQUEST_ERRORS = Counter("toron_requests_errors", "Total request errors")
REQUEST_TIMEOUTS = Counter("toron_requests_timeouts", "Total request timeouts")
PROVIDER_FAILURES = Counter("toron_provider_failures", "Provider failures")
CIRCUIT_OPEN = Counter("toron_circuit_breaker_opens", "Circuit breaker opens")
CACHE_HIT_L1 = Counter("toron_cache_hits_l1", "Cache hits L1")
CACHE_HIT_L2 = Counter("toron_cache_hits_l2", "Cache hits L2")
CACHE_HIT_L3 = Counter("toron_cache_hits_l3", "Cache hits L3")
LATENCY = Histogram(
    "toron_request_latency_ms",
    "Latency histogram in milliseconds",
    buckets=(5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000),
)


def record_request(latency_ms: float, cache_layer: str | None = None):
    REQUEST_TOTAL.inc()
    if cache_layer == "l1":
        CACHE_HIT_L1.inc()
    elif cache_layer == "l2":
        CACHE_HIT_L2.inc()
    elif cache_layer == "l3":
        CACHE_HIT_L3.inc()
    LATENCY.observe(latency_ms)


def record_error():
    REQUEST_ERRORS.inc()


def record_timeout():
    REQUEST_TIMEOUTS.inc()


def record_provider_failure():
    PROVIDER_FAILURES.inc()


def record_circuit_open():
    CIRCUIT_OPEN.inc()
