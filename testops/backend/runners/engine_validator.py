"""Synthetic health validation for Toron v2.5H+."""
from __future__ import annotations

import time
from typing import Any, Dict

from ryuzen.engine.toron_v25hplus import ToronEngine as ToronV25HPlus


class EngineValidator:
    """Runs a deterministic smoke prompt to ensure engine operability."""

    def __init__(self, prompt: str = "diagnostic:ping") -> None:
        self.prompt = prompt

    def validate(self) -> Dict[str, Any]:
        start = time.perf_counter()
        engine = ToronV25HPlus()
        output = engine.quick_health_check()
        latency_ms = int((time.perf_counter() - start) * 1000)
        shape = {
            "tiers": len(output.get("tiers", [])),
            "mal_status": output.get("mal_status"),
            "version": output.get("version"),
        }
        return {
            "success": bool(output),
            "latency_ms": latency_ms,
            "shape": shape,
            "prompt": self.prompt,
        }


__all__ = ["EngineValidator"]
