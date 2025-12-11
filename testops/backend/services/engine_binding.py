"""Singleton binding to the deterministic Toron v2.5H+ engine."""
from __future__ import annotations

import threading
import time
from pathlib import Path
from typing import Dict, Iterable, List

from ryuzen.engine.toron_v25hplus import ToronEngine

LOG_DIR = Path(__file__).resolve().parents[1] / "logs" / "master"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_PATH = LOG_DIR / "engine_binding.log"

_ENGINE_LOCK = threading.Lock()
_ENGINE_INSTANCE: ToronEngine | None = None


def _append_log(message: str) -> None:
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {message}\n")


def _get_engine() -> ToronEngine:
    global _ENGINE_INSTANCE
    if _ENGINE_INSTANCE is None:
        with _ENGINE_LOCK:
            if _ENGINE_INSTANCE is None:
                _ENGINE_INSTANCE = ToronEngine(now=0.0)
                _append_log("Initialized ToronEngine singleton in deterministic mode")
    return _ENGINE_INSTANCE


def run_single(prompt: str) -> Dict[str, object]:
    """Run a single prompt through the deterministic Toron engine."""

    engine = _get_engine()
    start = time.perf_counter()
    output = engine.run(prompt)
    latency_ms = int((time.perf_counter() - start) * 1000)
    _append_log(f"run_single prompt='{prompt[:48]}' latency_ms={latency_ms}")
    return output


def run_batch(prompts: Iterable[str]) -> List[Dict[str, object]]:
    """Execute a batch of prompts sequentially using the shared engine instance."""

    results: List[Dict[str, object]] = []
    for prompt in prompts:
        results.append(run_single(prompt))
    _append_log(f"run_batch executed {len(results)} prompts")
    return results


def warmup() -> Dict[str, object]:
    """Prime the engine caches and return the warmup health status."""

    engine = _get_engine()
    health = engine.quick_health_check()
    _append_log("Engine warmup invoked; healthcheck completed")
    return health


def healthcheck() -> Dict[str, object]:
    """Expose the engine's intrinsic health data without external calls."""

    engine = _get_engine()
    report = engine.quick_health_check()
    _append_log(f"Healthcheck captured: {report}")
    return report


__all__ = ["run_single", "run_batch", "warmup", "healthcheck"]
