import json
from typing import Dict, List

from testops_backend.core.config import WARROOM_DIR
from .warroom_logger import WARROOM_LOG


REMEDIATIONS = {
    "latency": "Investigate upstream services and increase cache TTL for Toron ingress.",
    "failures": "Check authentication tokens and retry budget configuration.",
    "instability": "Pin model versions and restart with deterministic seeds.",
}


def _read_entries() -> List[Dict]:
    if not WARROOM_LOG.exists():
        return []
    lines = WARROOM_LOG.read_text(encoding="utf-8").strip().splitlines()
    return [json.loads(line) for line in lines if line.strip()]


def analyze() -> Dict:
    entries = _read_entries()
    anomaly_types = {}
    for entry in entries:
        kind = entry.get("kind", "unknown")
        anomaly_types[kind] = anomaly_types.get(kind, 0) + 1

    suggestions = [
        {"kind": kind, "count": count, "remediation": REMEDIATIONS.get(kind, "Review logs and rerun determinstic replay.")}
        for kind, count in anomaly_types.items()
    ]

    stability = "stable" if not entries else "unstable" if any(count > 2 for count in anomaly_types.values()) else "watch"

    return {
        "entries": entries,
        "anomaly_types": anomaly_types,
        "stability": stability,
        "suggestions": suggestions,
    }
