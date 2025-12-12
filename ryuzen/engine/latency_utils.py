"""Latency stabilization utilities for Toron v2.5H+."""
from __future__ import annotations


def stable_latency(prompt: str, baseline: int = 320) -> int:
    """Deterministic, bounded latency smoothing tied to the prompt."""

    jitter = (hash(prompt) % 40) - 20
    latency = baseline + jitter
    return max(220, min(420, latency))
