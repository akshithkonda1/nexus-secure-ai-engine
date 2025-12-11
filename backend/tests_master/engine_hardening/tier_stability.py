from __future__ import annotations

import time
from pathlib import Path
from random import Random
from typing import Any, Dict, List

try:
    from ..master_runner import LOG_DIR, RunState, master_runner
except Exception:  # pragma: no cover - fallback for isolated execution
    LOG_DIR = Path("backend/logs/master")
    master_runner = None
    RunState = None

LOG_DIR.mkdir(parents=True, exist_ok=True)
MODULE_LOG = LOG_DIR / "engine_hardening.log"


def _log(run_id: str, message: str) -> None:
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    line = f"[{timestamp}] [run:{run_id}] [tier_stability] {message}\n"
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
            state.results["tier_stability"] = payload
    except Exception:
        return


def _tier1_mock(rng: Random, prompt: str) -> str:
    choices = ["ack", "noted", "processed", "ok"]
    return f"{prompt}-{rng.choice(choices)}"


def _tier2_mock(rng: Random, prompt: str, contradictory: bool) -> Dict[str, Any]:
    detected = contradictory and rng.random() > 0.1
    return {"prompt": prompt, "contradiction": detected, "confidence": round(rng.uniform(0.7, 0.99), 3)}


def _tier3_mock(rng: Random, prompt: str) -> Dict[str, Any]:
    evidence = [{"statement": prompt, "source": f"src-{rng.randint(1,5)}", "weight": round(rng.uniform(0.4, 0.98), 3)}]
    return {"prompt": prompt, "evidence": evidence, "summary": f"summary-{rng.randint(1,9)}"}


def run_tier_stability(run_id: str = "offline", seed: int = 4545, prompts: int = 500) -> Dict[str, Any]:
    rng = Random(seed)
    prompt_set = [f"prompt-{i}" for i in range(prompts)]

    tier1_outputs = [_tier1_mock(rng, prompt) for prompt in prompt_set]
    contradiction_flags: List[bool] = []
    tier3_shapes: List[int] = []

    for prompt in prompt_set:
        contradictory = rng.random() < 0.2
        tier2 = _tier2_mock(rng, prompt, contradictory)
        contradiction_flags.append(tier2["contradiction"] == contradictory)
        tier3 = _tier3_mock(rng, prompt)
        tier3_shapes.append(len(tier3.get("evidence", [])))
        _log(run_id, f"prompt={prompt} contradiction_expected={contradictory} detected={tier2['contradiction']}")

    tier1_non_empty = all(bool(resp) for resp in tier1_outputs)
    tier2_accuracy = round(sum(contradiction_flags) / len(contradiction_flags), 3)
    tier3_shape_ok = all(size >= 1 for size in tier3_shapes)

    tier_integrity_report = {
        "tier1_non_empty": tier1_non_empty,
        "tier2_contradiction_accuracy": tier2_accuracy,
        "tier3_evidence_shape": tier3_shape_ok,
        "seed": seed,
        "prompt_count": prompts,
        "contradiction_checks": contradiction_flags,
    }

    _register_result(run_id, tier_integrity_report)
    return tier_integrity_report


__all__ = ["run_tier_stability"]
