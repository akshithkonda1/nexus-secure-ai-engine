"""Healthcheck utilities for ToronEngine."""
from __future__ import annotations

import time
from statistics import mean
from typing import Dict, List

from .adapter import EngineAdapter
from .version_lock import EXPECTED_VERSION


async def run_healthcheck() -> Dict[str, object]:
    adapter = EngineAdapter()
    prompts: List[str] = [
        "diagnostic: coherence",
        "diagnostic: stability",
        "diagnostic: latency",
    ]
    latencies: List[float] = []
    for prompt in prompts:
        start = time.perf_counter()
        result = await adapter.run(prompt, max_retries=1)
        latencies.append((time.perf_counter() - start) * 1000)
        if not result.get("success"):
            return {
                "engine_ok": False,
                "version": EXPECTED_VERSION,
                "latency_estimate_ms": None,
                "error": result.get("error", "unknown"),
            }

    latency_estimate = round(mean(latencies), 2) if latencies else None
    return {"engine_ok": True, "version": EXPECTED_VERSION, "latency_estimate_ms": latency_estimate}


__all__ = ["run_healthcheck"]
