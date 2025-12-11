from __future__ import annotations

import math
import statistics
import time
from pathlib import Path
from random import Random
from typing import Any, Dict, List, Tuple

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
    line = f"[{timestamp}] [run:{run_id}] [routing_validator] {message}\n"
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
            state.results["routing_validator"] = payload
    except Exception:
        return


def _synthetic_prompts() -> List[Tuple[str, int]]:
    return [
        ("short factual", 1),
        ("creative rewrite", 2),
        ("safety escalation", 3),
        ("financial planning", 2),
        ("code generation", 3),
        ("light chat", 1),
        ("policy edge", 3),
        ("complex reasoning", 3),
        ("translation", 1),
        ("multi-hop research", 3),
    ]


def _decide_route(rng: Random, prompt_type: int) -> str:
    baseline = {1: ["tier_1", "tier_2"], 2: ["tier_2", "tier_3"], 3: ["tier_3", "opus"]}
    choices = baseline.get(prompt_type, ["tier_1"])
    return rng.choice(choices)


def run_routing_validator(run_id: str = "offline", seed: int = 9911) -> Dict[str, Any]:
    rng = Random(seed)
    prompts = _synthetic_prompts()

    routing_decisions: List[str] = []
    unnecessary_opus = 0
    tier1_over = 0
    tier3_under = 0
    instabilities = 0

    for idx, (prompt, tier) in enumerate(prompts):
        decision = _decide_route(rng, tier)
        routing_decisions.append(decision)
        if decision == "opus" and tier < 3:
            unnecessary_opus += 1
        if decision == "tier_1" and tier > 1:
            tier1_over += 1
        if decision != "tier_3" and tier == 3:
            tier3_under += 1
        if idx > 0 and routing_decisions[-1] != routing_decisions[-2]:
            instabilities += 1
        _log(run_id, f"prompt='{prompt}' tier_hint={tier} decision={decision}")

    stability_penalty = (unnecessary_opus * 0.15) + (tier1_over * 0.1) + (tier3_under * 0.25) + (instabilities * 0.02)
    base_score = 1.0
    routing_stability_score = max(0.0, round(base_score - stability_penalty, 3))

    distribution = {tier: routing_decisions.count(tier) for tier in {"tier_1", "tier_2", "tier_3", "opus"}}
    entropy = 0.0
    total = len(routing_decisions)
    for count in distribution.values():
        if count:
            probability = count / total
            entropy -= probability * math.log(probability, 2)
    drift = statistics.pstdev(list(distribution.values()))

    result = {
        "routing_stability_score": routing_stability_score,
        "decisions": routing_decisions,
        "distribution": distribution,
        "instability_events": instabilities,
        "unnecessary_opus": unnecessary_opus,
        "tier1_over_firing": tier1_over,
        "tier3_underuse": tier3_under,
        "entropy_proxy": round(entropy, 5),
        "distribution_drift": round(drift, 3),
        "seed": seed,
    }

    if routing_stability_score < 0.7:
        _log(run_id, "routing instability detected")
    _register_result(run_id, result)
    return result


__all__ = ["run_routing_validator"]
