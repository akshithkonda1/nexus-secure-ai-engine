"""Run the Toron engine simulation pipeline end-to-end."""

from __future__ import annotations

import json
import statistics
import time
from pathlib import Path
from typing import Dict, List

from .bad_input_suite import ADVERSARIAL_PROMPTS
from .deterministic_harness import DeterministicHarness
from .nexus_engine import Engine
from .toron_logger import get_logger, log_event

logger = get_logger("nexus.simulation")


def _disagreement(responses: List[Dict[str, object]]) -> bool:
    outputs = [r.get("output") for r in responses if isinstance(r, dict)]
    return len(set(outputs)) > 1 if outputs else False


def run_simulation(prompts: List[str] | None = None) -> Dict[str, object]:
    harness = DeterministicHarness()
    engine = Engine(sim_mode=True)
    prompts = prompts or ADVERSARIAL_PROMPTS[:10]

    model_latencies: List[float] = []
    search_latencies: List[float] = []
    claim_counts: List[int] = []
    verified_counts: List[int] = []
    disagreements: int = 0
    errors: int = 0

    t0 = time.perf_counter()
    for prompt in prompts:
        start = time.perf_counter()
        result = engine.run_with_verification(prompt)
        elapsed = time.perf_counter() - start
        log_event(logger, "simulation.iteration", prompt=prompt, latency=elapsed)

        outputs = result.get("model_outputs", [])
        model_latencies.extend([o.get("latency", 0.0) for o in outputs if isinstance(o, dict)])
        verified = result.get("verified_claims", [])
        search_latencies.extend([v.get("latency", 0.0) for v in verified if isinstance(v, dict)])
        claim_counts.append(len(result.get("claims", [])))
        verified_counts.append(sum(1 for v in verified if v.get("verified")))
        if _disagreement(outputs):
            disagreements += 1
        errors += len(result.get("errors", []))

    duration = time.perf_counter() - t0
    summary = {
        "run": harness.snapshot(),
        "avg_model_latency": statistics.mean(model_latencies) if model_latencies else 0.0,
        "avg_search_latency": statistics.mean(search_latencies) if search_latencies else 0.0,
        "disagreement_pct": disagreements / len(prompts) * 100 if prompts else 0.0,
        "claim_extraction_rate": statistics.mean(claim_counts) if claim_counts else 0.0,
        "verification_hit_rate": (
            statistics.mean(verified_counts) / (statistics.mean(claim_counts) or 1)
            if verified_counts
            else 0.0
        ),
        "error_count": errors,
        "runtime_seconds": duration,
    }

    output_dir = Path(harness.snapshot()["output_dir"])
    output_path = output_dir / "summary.json"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(summary, indent=2))
    log_event(logger, "simulation.complete", output=str(output_path))
    return summary


if __name__ == "__main__":  # pragma: no cover
    print(json.dumps(run_simulation(), indent=2))
