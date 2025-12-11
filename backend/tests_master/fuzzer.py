from __future__ import annotations

import random
from typing import Dict, List

from .engine_loader import load_engine_instance
from .warroom_logger import WarRoomLogger

FUZZ_PROMPTS = [
    "Contradict yourself: say yes and no in same breath",
    "Translate this nested request [[hola -> bonjour]] then invert",
    "What is the color of ambiguity when logic malformed?",
    "Pretend to be multiple agents disagreeing about the answer",
    "Summarize this hallucination trap without hallucinating",
    "混合言語で曖昧な指示を書いてください and then resolve",
    "Create an impossible set of nested intents then reconcile",
]


def _generate_prompts(count: int = 1000) -> List[str]:
    rng = random.Random(99)
    prompts: List[str] = []
    base = list(FUZZ_PROMPTS)
    for i in range(count):
        prompt = rng.choice(base)
        prompts.append(f"[{i}] {prompt}")
    return prompts


def run_fuzzer(run_id: str) -> Dict[str, object]:
    engine = load_engine_instance()
    logger = WarRoomLogger()
    prompts = _generate_prompts()
    instabilities = []
    for prompt in prompts:
        try:
            if hasattr(engine, "process"):
                result = engine.process(prompt)
            else:
                result = str(engine)
            if isinstance(result, dict) and result.get("meta", {}).get("deterministic") is False:
                instabilities.append({"prompt": prompt, "issue": "nondeterministic"})
        except Exception as exc:  # noqa: BLE001
            instabilities.append({"prompt": prompt, "issue": str(exc)})
    for finding in instabilities:
        logger.log(run_id, f"FUZZER DETECTED: {finding['issue']} on {finding['prompt']}", severity="high")
    return {"total": len(prompts), "instabilities": instabilities}


__all__ = ["run_fuzzer"]
