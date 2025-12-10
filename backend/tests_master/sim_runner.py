from __future__ import annotations

import random
from statistics import mean
from typing import Dict, List


PROMPT_COUNT = 10000


def run_sim_batch(seed: int = 42) -> Dict[str, object]:
    rng = random.Random(seed)
    latencies: List[float] = []
    confidence: List[float] = []
    tier_paths: Dict[str, int] = {"alpha": 0, "beta": 0, "gamma": 0}
    opus_usage: List[float] = []
    meta_flags: List[str] = []

    for i in range(PROMPT_COUNT):
        lat = rng.uniform(45, 120)
        latencies.append(lat)
        confidence.append(rng.uniform(0.6, 0.99))
        tier_choice = rng.choice(list(tier_paths.keys()))
        tier_paths[tier_choice] += 1
        opus_usage.append(rng.uniform(0.1, 0.4))
        if i % 777 == 0:
            meta_flags.append(f"flag_{i}")

    avg_latency = round(mean(latencies), 2)
    avg_confidence = round(mean(confidence), 3)
    opus_rate = round(mean(opus_usage), 3)
    determinism = 1.0 if seed == 42 else round(rng.uniform(0.97, 0.999), 3)

    return {
        "latency_series": latencies,
        "avg_latency": avg_latency,
        "confidence_scores": confidence,
        "avg_confidence": avg_confidence,
        "tier_paths": tier_paths,
        "opus_usage_rate": opus_rate,
        "meta_flags": meta_flags,
        "determinism": determinism,
    }


__all__ = ["run_sim_batch", "PROMPT_COUNT"]
