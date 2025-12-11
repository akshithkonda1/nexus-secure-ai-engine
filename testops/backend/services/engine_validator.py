"""Validation harness for Toron v2.5H+ readiness."""
from __future__ import annotations

import time
from pathlib import Path
from typing import Dict, List, Tuple

from ryuzen.engine.toron_v25hplus import ModelAbstractionLayer, ToronEngine

from .engine_binding import healthcheck, run_single, warmup

LOG_DIR = Path(__file__).resolve().parents[1] / "logs" / "master"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_PATH = LOG_DIR / "engine_validator.log"

_REQUIRED_MODELS: Tuple[str, ...] = ("Opus", "Claude-Sonnet-4.5", "GPT-5.1")
_EXPECTED_PIPELINE_PATH = "T1->T1_SUMMARY->CDG->T2->MMRE->SYNTH->JUDICIAL->RWL->CONSENSUS->ALOE"
_SNAPSHOT_KEYS: Tuple[str, ...] = (
    "CLEAN_PROMPT",
    "EXECUTION_PLAN",
    "T1_RAW",
    "T1_SUMMARY",
    "CDG_STRUCTURE",
    "T2_AUDIT_REPORT",
    "REALITY_PACKET",
    "JUDICIAL_RESULT",
    "RWL_RESULT",
    "CONFIDENCE_SCORE",
    "ALOE_POLICY",
    "MSL_FLAGS",
)


def _append_log(message: str) -> None:
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {message}\n")


def _validate_models(engine: ToronEngine) -> List[str]:
    missing = [m for m in _REQUIRED_MODELS if m not in ModelAbstractionLayer.SUPPORTED_MODELS]
    if missing:
        _append_log(f"Missing MAL models: {missing}")
    else:
        _append_log("All MAL models present")
    return missing


def _validate_pipeline_shape(output: Dict[str, object]) -> List[str]:
    issues: List[str] = []
    if output.get("tier_path") != _EXPECTED_PIPELINE_PATH:
        issues.append("pipeline_order")
    snapshot = output.get("state_snapshot", {})
    missing_snapshot = [key for key in _SNAPSHOT_KEYS if key not in snapshot]
    if missing_snapshot:
        issues.append(f"snapshot_missing:{','.join(missing_snapshot)}")
    if issues:
        _append_log(f"Pipeline snapshot issues detected: {issues}")
    else:
        _append_log("Pipeline path and snapshot structure validated")
    return issues


def _validate_mal(engine: ToronEngine) -> List[str]:
    problems: List[str] = []
    try:
        probe = engine.mal.call_model("Opus", "engine:probe")
        if not probe.response:
            problems.append("mal_empty_response")
    except Exception as exc:  # pragma: no cover - defensive guard
        problems.append(f"mal_exception:{exc}")
    if problems:
        _append_log(f"MAL validation uncovered: {problems}")
    else:
        _append_log("MAL probe succeeded")
    return problems


def validate_engine() -> Dict[str, object]:
    """Validate engine compatibility and readiness without external calls."""

    warmup_report = warmup()
    engine = ToronEngine(now=0.0)
    failing_components: List[str] = []

    missing_models = _validate_models(engine)
    failing_components.extend([f"missing_model:{m}" for m in missing_models])

    mal_issues = _validate_mal(engine)
    failing_components.extend(mal_issues)

    deterministic_output = run_single("testops::engine_validation_probe")
    pipeline_issues = _validate_pipeline_shape(deterministic_output)
    failing_components.extend(pipeline_issues)

    engine_ready = len(failing_components) == 0
    payload = {
        "engine_ready": engine_ready,
        "failing_components": failing_components,
        "healthcheck": healthcheck(),
        "warmup": warmup_report,
        "sample_output_shape": {
            "keys": sorted(deterministic_output.keys()),
            "snapshot_keys": sorted(deterministic_output.get("state_snapshot", {}).keys()),
        },
    }
    _append_log(f"Engine validation completed; ready={engine_ready}")
    return payload


class EngineValidator:
    """Object wrapper for consumers expecting an instance API."""

    def validate(self) -> Dict[str, object]:
        return validate_engine()


__all__ = ["EngineValidator", "validate_engine"]
