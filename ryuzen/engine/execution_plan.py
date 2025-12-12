"""Execution plan stabilization utilities."""
from __future__ import annotations

from typing import Any

from ryuzen.engine.latency_utils import stable_latency
from ryuzen.engine.snapshot_utils import normalize_snapshot
from ryuzen.engine.tier_utils import normalized_pipeline


def stabilize_execution_plan(ep: Any) -> Any:
    """Ensure execution plan parameters are consistent and repeatable."""

    ep.latency_ms = stable_latency()
    ep.tier_path = normalized_pipeline(ep)
    ep.snapshot = normalize_snapshot(getattr(ep, "snapshot", {}) or {})
    return ep


__all__ = ["stabilize_execution_plan"]
