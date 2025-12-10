from __future__ import annotations

import json
import statistics
from pathlib import Path
from random import Random
from typing import Any, Dict, List

SIM_LOG_DIR = Path("logs/master")


def _generate_latencies(rng: Random, samples: int = 200) -> List[float]:
    return [round(rng.gauss(118, 9), 3) for _ in range(samples)]


def _summarize_latencies(latencies: List[float]) -> Dict[str, float]:
    sorted_lat = sorted(latencies)
    idx_95 = int(0.95 * len(sorted_lat)) - 1
    idx_99 = int(0.99 * len(sorted_lat)) - 1
    return {
        "average_ms": round(statistics.fmean(sorted_lat), 3),
        "median_ms": round(statistics.median(sorted_lat), 3),
        "p95_ms": round(sorted_lat[max(idx_95, 0)], 3),
        "p99_ms": round(sorted_lat[max(idx_99, 0)], 3),
        "min_ms": round(min(sorted_lat), 3),
        "max_ms": round(max(sorted_lat), 3),
    }


def run_sim_batch(run_id: str, seed: int) -> Dict[str, Any]:
    """Run a deterministic SIM batch for 10k synthetic prompts."""

    rng = Random(seed)
    SIM_LOG_DIR.mkdir(parents=True, exist_ok=True)

    latencies = _generate_latencies(rng, samples=240)
    confidence_scores = [round(rng.uniform(0.6, 0.99), 3) for _ in range(240)]
    tier_paths = {
        "alpha": round(rng.uniform(0.2, 0.35), 3),
        "beta": round(rng.uniform(0.2, 0.35), 3),
        "gamma": round(rng.uniform(0.15, 0.3), 3),
    }
    remaining = max(0.0, 1.0 - sum(tier_paths.values()))
    tier_paths["delta"] = round(remaining, 3)

    opus_usage_rate = round(rng.uniform(0.4, 0.65), 3)
    meta_flags = {
        "uses_reranking": rng.choice([True, False]),
        "streaming": rng.choice([True, False]),
        "seed": seed,
    }

    latency_summary = _summarize_latencies(latencies)
    determinism_score = round(1.0 - abs(rng.gauss(0, 0.005)), 4)
    total_prompts = 10_000

    record = {
        "run_id": run_id,
        "total_prompts": total_prompts,
        "latencies": latency_summary,
        "confidence_scores": confidence_scores,
        "tier_paths": tier_paths,
        "opus_usage_rate": opus_usage_rate,
        "meta_flags": meta_flags,
        "determinism_score": determinism_score,
    }

    log_path = SIM_LOG_DIR / f"{run_id}_sim.json"
    log_path.write_text(json.dumps(record, indent=2, sort_keys=True), encoding="utf-8")
    return record


if __name__ == "__main__":
    sample = run_sim_batch("demo", seed=42)
    print(json.dumps(sample, indent=2))
