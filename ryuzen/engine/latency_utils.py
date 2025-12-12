"""Latency stabilization utilities for Toron v2.5H+."""
from __future__ import annotations

import random


def stable_latency(base: int = 320, jitter_range: int = 40, minimum: int = 120, maximum: int = 480) -> int:
    """
    Produce smooth, production-like latency curves.

    The helper intentionally caps jitter to avoid the violent spikes that
    can destabilize simulated runners and downstream orchestration.
    """

    jitter = random.randint(-jitter_range, jitter_range)
    latency = base + jitter
    return max(minimum, min(maximum, latency))
