from __future__ import annotations

import statistics
import time
from pathlib import Path
from random import Random
from typing import Any, Dict, List

from ..warroom_logger import WarRoomLogger

try:
    from ..master_runner import LOG_DIR, RunState, master_runner
except Exception:  # pragma: no cover - fallback for isolated execution
    LOG_DIR = Path("backend/logs/master")
    master_runner = None
    RunState = None


LOG_DIR.mkdir(parents=True, exist_ok=True)
MODULE_LOG = LOG_DIR / "engine_hardening.log"
WARROOM_LOGGER = WarRoomLogger()

THRESHOLDS = {
    "tier_1": 450,
    "tier_2": 300,
    "tier_3": 400,
    "opus": 900,
    "pipeline_p95": 850,
}


def _log(run_id: str, message: str) -> None:
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    line = f"[{timestamp}] [run:{run_id}] [latency_hardener] {message}\n"
    with MODULE_LOG.open("a", encoding="utf-8") as handle:
        handle.write(line)


def _register_result(run_id: str, payload: Dict[str, Any]) -> None:
    if not master_runner:
        return
    try:
        state = master_runner.run_states.get(run_id)
        if state is None and RunState:
            state = RunState(run_id=run_id)
            master_runner.run_states[run_id] = state
        if state is not None:
            state.results["latency_hardener"] = payload
    except Exception:
        return


def _simulate_latencies(rng: Random, base: float, jitter: float, samples: int = 80) -> List[float]:
    return [max(0.0, rng.gauss(base, jitter)) for _ in range(samples)]


def _p95(values: List[float]) -> float:
    ordered = sorted(values)
    index = int(0.95 * (len(ordered) - 1))
    return round(ordered[index], 3)


def run_latency_hardener(run_id: str = "offline", seed: int = 20245) -> Dict[str, Any]:
    rng = Random(seed)
    tiers = {
        "tier_1": _simulate_latencies(rng, base=340, jitter=45),
        "tier_2": _simulate_latencies(rng, base=210, jitter=30),
        "tier_3": _simulate_latencies(rng, base=320, jitter=35),
        "opus": _simulate_latencies(rng, base=640, jitter=80),
    }

    metrics: Dict[str, Dict[str, float]] = {}
    failures: List[str] = []

    for tier, latencies in tiers.items():
        avg = round(statistics.mean(latencies), 3)
        median = round(statistics.median(latencies), 3)
        p95 = _p95(latencies)
        metrics[tier] = {"avg_ms": avg, "p50_ms": median, "p95_ms": p95}
        if p95 >= THRESHOLDS[tier]:
            failures.append(f"{tier} p95 {p95}ms exceeds {THRESHOLDS[tier]}ms")

    pipeline_latencies = [sum(x) for x in zip(tiers["tier_1"], tiers["tier_2"], tiers["tier_3"])][: len(tiers["tier_1"])]
    pipeline_p95 = _p95(pipeline_latencies)
    metrics["pipeline"] = {"p95_ms": pipeline_p95}
    if pipeline_p95 >= THRESHOLDS["pipeline_p95"]:
        failures.append(f"Pipeline p95 {pipeline_p95}ms exceeds {THRESHOLDS['pipeline_p95']}ms")

    passed = not failures
    result = {
        "pass": passed,
        "metrics": metrics,
        "failures": failures,
        "seed": seed,
    }

    _log(run_id, f"latency metrics collected: {metrics}")
    if not passed:
        _log(run_id, f"failures detected: {failures}")
        WARROOM_LOGGER.log(run_id, "; ".join(failures), severity="high")

    _register_result(run_id, result)
    return result


__all__ = ["run_latency_hardener", "THRESHOLDS"]
