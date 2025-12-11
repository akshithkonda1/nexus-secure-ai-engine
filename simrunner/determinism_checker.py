"""Determinism checker for Toron Engine outputs."""
from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any, Dict, List

from .generator import load_or_generate
from .sim_runner import ToronEngine, load_config


VOLATILE_KEYS = {"latency_ms", "timestamp", "generated_at"}


def _strip_volatiles(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: _strip_volatiles(v) for k, v in obj.items() if k not in VOLATILE_KEYS}
    if isinstance(obj, list):
        return [_strip_volatiles(v) for v in obj]
    return obj


def _stable_repr(obj: Any) -> str:
    try:
        cleaned = _strip_volatiles(obj)
        return json.dumps(cleaned, sort_keys=True, separators=(",", ":"))
    except Exception:
        return str(obj)


def _compute_scores(outputs: List[Any]) -> Dict[str, float]:
    normalized = [_stable_repr(o) for o in outputs]
    byte_identical = len(set(normalized)) == 1
    semantic_match = byte_identical

    if not byte_identical:
        baseline = normalized[0]
        match_count = sum(1 for item in normalized if item == baseline)
        semantic_match = match_count / len(normalized)

    determinism = 1.0 if byte_identical else max(0.0, min(1.0, semantic_match))
    return {
        "byte_match_rate": 1.0 if byte_identical else 0.0,
        "semantic_match_rate": determinism,
        "determinism_score": round(determinism * 100, 2),
    }


def run_determinism_checks(
    config_path: str = os.path.join("simrunner", "sim_config.yaml"),
    dataset_path: str = os.path.join("simrunner", "synthetic_dataset.json"),
    output_dir: str = os.path.join("simrunner", "reports"),
    sample_size: int = 5,
) -> Dict[str, Any]:
    config = load_config(config_path)
    prompts = load_or_generate(dataset_path, sample_size, config.get("seed", 42))
    engine = ToronEngine()
    os.makedirs(output_dir, exist_ok=True)

    results: List[Dict[str, Any]] = []
    overall_scores: List[float] = []

    for prompt in prompts[:sample_size]:
        outputs = []
        for _ in range(3):
            try:
                result = engine.run(prompt=prompt, seed=config.get("seed", 42))
            except Exception as exc:  # pragma: no cover
                result = {"error": f"Toron failure: {exc}"}
            outputs.append(result)

        score = _compute_scores(outputs)
        overall_scores.append(score["determinism_score"])
        results.append({
            "prompt": prompt,
            "runs": outputs,
            "byte_match_rate": score["byte_match_rate"],
            "semantic_match_rate": score["semantic_match_rate"],
            "determinism_score": score["determinism_score"],
        })

    aggregate_score = sum(overall_scores) / len(overall_scores) if overall_scores else 0.0
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    report = {
        "config_seed": config.get("seed", 42),
        "sample_size": len(results),
        "determinism_score": round(aggregate_score, 2),
        "tests": results,
        "generated_at": timestamp,
    }

    output_file = os.path.join(output_dir, f"determinism_report_{timestamp}.json")
    try:
        with open(output_file, "w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2)
    except Exception:
        pass

    report["output_file"] = output_file
    return report


if __name__ == "__main__":  # pragma: no cover
    run_determinism_checks()
