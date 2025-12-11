"""Core simulation runner for the Toron Engine v2.5H+ suite."""
from __future__ import annotations

import datetime
import json
import os
import time
from typing import Any, Dict, List, Tuple

from . import tier_logger
from .generator import load_or_generate

try:  # pragma: no cover - defensive import
    from ryuzen.engine.toron_v25hplus import ToronEngine  # type: ignore
except Exception:  # pragma: no cover
    class ToronEngine:  # type: ignore
        """Fallback deterministic stub when Toron is unavailable."""

        def __init__(self, *args: Any, **kwargs: Any) -> None:
            self._salt = 17

        def run(self, prompt: str, seed: int | None = None) -> Dict[str, Any]:
            pseudo_seed = (seed or 0) + self._salt + hash(prompt) % 10_000
            pseudo = pseudo_seed % 100
            latency = 50 + (pseudo % 25)
            contradiction = pseudo % 3
            confidence = round(0.5 + (pseudo % 30) / 100.0, 2)
            tiers = ["T1", "T2" if pseudo % 2 == 0 else "T3"]
            return {
                "response": f"Stubbed response for: {prompt[:40]}...",
                "latency_ms": latency,
                "tiers": tiers,
                "opus": pseudo % 5 == 0,
                "flags": ["synthetic"],
                "contradictions": contradiction,
                "confidence": confidence,
            }


DEFAULT_CONFIG = {
    "run_count": 1000,
    "seed": 42,
    "latency_tracking": True,
    "opus_tracking": True,
    "determinism_checks": True,
    "snapshot_compare_mode": "strict",
    "max_prompts": 10_000,
}


def _parse_value(raw_value: str) -> Any:
    lowered = raw_value.lower()
    if lowered in {"true", "yes", "on"}:
        return True
    if lowered in {"false", "no", "off"}:
        return False
    try:
        return int(raw_value)
    except ValueError:
        return raw_value


def load_config(config_path: str) -> Dict[str, Any]:
    if not os.path.exists(config_path):
        return dict(DEFAULT_CONFIG)

    parsed: Dict[str, Any] = {}
    try:
        with open(config_path, "r", encoding="utf-8") as handle:
            for line in handle:
                stripped = line.strip()
                if not stripped or stripped.startswith("#"):
                    continue
                if ":" not in stripped:
                    continue
                key, value = stripped.split(":", 1)
                parsed[key.strip()] = _parse_value(value.strip())
    except Exception:
        parsed = {}

    merged = dict(DEFAULT_CONFIG)
    merged.update(parsed)
    return merged


def _prepare_output_dir(base_dir: str) -> str:
    os.makedirs(base_dir, exist_ok=True)
    return base_dir


def _safe_run_engine(engine: ToronEngine, prompt: str, seed: int) -> Tuple[Dict[str, Any], float, str | None]:
    start = time.perf_counter()
    error: str | None = None
    result: Dict[str, Any] = {}
    try:
        maybe = engine.run(prompt=prompt, seed=seed)
        if isinstance(maybe, dict):
            result = maybe
        else:
            result = {"response": str(maybe)}
    except Exception as exc:  # pragma: no cover - defensive path
        error = f"Toron failure: {exc}"
    latency_ms = round((time.perf_counter() - start) * 1000, 3)
    if "latency_ms" not in result:
        result["latency_ms"] = latency_ms
    return result, latency_ms, error


def run_simulations(
    config_path: str = os.path.join("simrunner", "sim_config.yaml"),
    dataset_path: str = os.path.join("simrunner", "synthetic_dataset.json"),
    output_dir: str = os.path.join("simrunner", "reports"),
) -> Dict[str, Any]:
    config = load_config(config_path)
    prompts = load_or_generate(dataset_path, config.get("max_prompts", 10_000), config.get("seed", 42))
    run_count = int(config.get("run_count", 0))
    if run_count <= 0:
        run_count = 1

    engine = ToronEngine()
    results: List[Dict[str, Any]] = []

    for idx in range(run_count):
        prompt = prompts[idx % len(prompts)] if prompts else f"Generated prompt {idx}"
        seed = int(config.get("seed", 0)) + idx
        run_payload, measured_latency, error = _safe_run_engine(engine, prompt, seed)
        tier_info = tier_logger.extract_tier_info(run_payload)

        record = {
            "run_id": idx + 1,
            "prompt": prompt,
            "latency_ms": measured_latency,
            "tier_path": tier_info.get("tier_path", []),
            "opus_used": tier_info.get("opus_used", False),
            "meta_surveillance_flags": tier_info.get("flags", []),
            "contradiction_count": tier_info.get("contradictions", 0),
            "confidence_score": tier_info.get("confidence", None),
            "raw_response": run_payload,
            "error": error,
        }
        results.append(record)

    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    _prepare_output_dir(output_dir)
    results_file = os.path.join(output_dir, f"sim_results_{timestamp}.json")
    summary = {
        "metadata": {
            "run_count": run_count,
            "seed": config.get("seed", 42),
            "generated_at": timestamp,
            "snapshot_compare_mode": config.get("snapshot_compare_mode", "strict"),
        },
        "results": results,
    }

    try:
        with open(results_file, "w", encoding="utf-8") as handle:
            json.dump(summary, handle, indent=2)
    except Exception:
        # Last-resort guardrail: ensure simulations never crash
        pass

    return {"results": results, "metadata": summary["metadata"], "results_file": results_file}


if __name__ == "__main__":  # pragma: no cover
    run_simulations()
