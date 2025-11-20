import time
from typing import Dict

from .ConnectorState import ConnectorState


def compute_health(state: ConnectorState) -> float:
    score = 100.0
    if state.status == "error":
        score -= 40
    score -= min(state.error_count * 5, 30)
    if state.token_age > 3600 * 12:
        score -= 10
    if state.items_indexed == 0:
        score -= 5
    return max(0.0, min(100.0, score))


def detect_token_expiry(state: ConnectorState) -> bool:
    return state.token_age > 3600 * 24 or state.status == "error"


def detect_rate_limit_pressure(state: ConnectorState) -> bool:
    throttle = state.metadata.get("throttle_hits", 0)
    return throttle > 3


def detect_outage_patterns(state: ConnectorState) -> bool:
    return state.error_count > 5 and time.time() - (state.last_sync or 0) < 1800


def detect_slow_sync(state: ConnectorState) -> bool:
    latency = state.metadata.get("sync_latency_ms")
    return latency is not None and latency > 30_000

