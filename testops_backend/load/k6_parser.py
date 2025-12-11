from typing import Dict


def parse_summary(summary: Dict) -> Dict[str, float]:
    """Extract p95, p99, req/sec, and failure rate from a k6 summary JSON."""

    metrics = summary.get("metrics", {})
    http_req_duration = metrics.get("http_req_duration", {}).get("percentiles", {})
    http_reqs = metrics.get("http_reqs", {})
    failures = metrics.get("checks", {}).get("fails", {}).get("count", 0) if metrics.get("checks") else 0
    total = http_reqs.get("count", 1)

    req_per_sec = http_reqs.get("rate", 0.0)
    failure_rate = float(failures) / float(total or 1)

    return {
        "p95": float(http_req_duration.get("p(95)", 0.0)),
        "p99": float(http_req_duration.get("p(99)", 0.0)),
        "req_per_sec": float(req_per_sec),
        "failure_rate": float(failure_rate),
    }
