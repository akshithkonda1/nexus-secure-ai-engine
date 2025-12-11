"""Pipeline checks to ensure T1/T2/T3 and escalation flows do not crash."""
from __future__ import annotations

import time
from typing import Dict, List

from testops.backend.engine_adapter.adapter import EngineAdapter


async def run_pipeline_checks(adapter: EngineAdapter) -> Dict[str, object]:
    stages = ["T1", "T2", "T3", "Opus escalation"]
    results: List[Dict[str, object]] = []
    for stage in stages:
        start = time.perf_counter()
        payload = f"pipeline check: {stage}"
        outcome = await adapter.run(payload)
        results.append(
            {
                "stage": stage,
                "success": outcome.get("success", False),
                "latency_ms": outcome.get("latency_ms", round((time.perf_counter() - start) * 1000, 2)),
                "output": outcome.get("output"),
            }
        )

    return {"label": "pipeline_checker", "results": results}


__all__ = ["run_pipeline_checks"]
