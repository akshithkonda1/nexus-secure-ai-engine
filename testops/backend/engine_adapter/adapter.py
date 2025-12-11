"""Adapter around the ToronEngine entrypoint with retries and structured output."""
from __future__ import annotations

import asyncio
import time
from typing import Any, Dict, Optional

from .version_lock import ToronEngine, enforce_version


class EngineAdapter:
    """Safe wrapper around the ToronEngine lifecycle."""

    def __init__(self, engine: Optional[ToronEngine] = None) -> None:
        enforce_version(ToronEngine)
        self.engine = engine or ToronEngine()

    async def warmup(self) -> Dict[str, Any]:
        """Execute a fast warmup to confirm the engine is callable."""

        return await self.run("warmup: confirm readiness", max_retries=1)

    async def run(self, prompt: str, max_retries: int = 2) -> Dict[str, Any]:
        """Run the engine with retries and latency measurement."""

        attempt = 0
        last_error: Optional[str] = None
        start_time = time.perf_counter()
        while attempt <= max_retries:
            attempt += 1
            try:
                result = await self._invoke_engine(prompt)
                latency = (time.perf_counter() - start_time) * 1000
                return {
                    "success": True,
                    "attempt": attempt,
                    "latency_ms": round(latency, 2),
                    "output": result,
                }
            except Exception as exc:  # pragma: no cover - defensive guard
                last_error = str(exc)
                await asyncio.sleep(0 if attempt > max_retries else 0.05)

        return {
            "success": False,
            "attempt": attempt,
            "latency_ms": round((time.perf_counter() - start_time) * 1000, 2),
            "error": last_error or "Unknown failure",
        }

    async def _invoke_engine(self, prompt: str) -> Any:
        """Call the ToronEngine safely."""

        maybe_coroutine = self.engine(prompt) if callable(self.engine) else None
        if maybe_coroutine is not None:
            if asyncio.iscoroutine(maybe_coroutine):
                return await maybe_coroutine
            return maybe_coroutine

        if hasattr(self.engine, "run"):
            outcome = self.engine.run(prompt)
            if asyncio.iscoroutine(outcome):
                return await outcome
            return outcome

        raise RuntimeError("ToronEngine instance is not callable and lacks a run method")


__all__ = ["EngineAdapter"]
