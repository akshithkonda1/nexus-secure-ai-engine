"""Consistency checks for master TestOps pipeline outputs."""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping

TIER_SECTIONS = [
    "sim_suite",
    "engine_hardening",
    "cloud_hardening",
    "security_hardening",
    "load_and_chaos",
    "replay",
    "beta_readiness",
    "public_beta",
    "v3_migration",
]


def _ensure_path(path_value: str | Path) -> Path:
    path = Path(path_value).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(f"Expected artifact path does not exist: {path}")
    return path


def normalize_modules(modules: Iterable[Mapping[str, Any]]) -> List[Dict[str, Any]]:
    normalized: List[Dict[str, Any]] = []
    for module in modules:
        normalized.append(
            {
                "name": str(module.get("name")),
                "status": str(module.get("status", "UNKNOWN")),
                "metrics": module.get("metrics", {}),
                "notes": list(module.get("notes", [])),
            }
        )
    return normalized


def check_pipeline_consistency(payload: Mapping[str, Any]) -> Dict[str, Any]:
    missing_sections = [section for section in TIER_SECTIONS if section not in payload]
    failed_modules: List[str] = []
    module_inventory: Dict[str, List[Dict[str, Any]]] = {}
    for section in TIER_SECTIONS:
        modules = normalize_modules(payload.get(section, []))
        module_inventory[section] = modules
        for module in modules:
            if module.get("status") != "PASS":
                failed_modules.append(f"{section}:{module.get('name')}")
    determinism_score = payload.get("determinism_score")
    artifacts = payload.get("artifacts", {})
    artifact_errors: List[str] = []
    for key in ("sim_data", "load_data", "determinism"):
        if key in artifacts:
            try:
                _ensure_path(artifacts[key])
            except FileNotFoundError as exc:
                artifact_errors.append(str(exc))
        else:
            artifact_errors.append(f"Missing artifact key: {key}")
    consistent = not missing_sections and not failed_modules and not artifact_errors and determinism_score is not None
    return {
        "consistent": consistent,
        "missing_sections": missing_sections,
        "failed_modules": failed_modules,
        "artifact_errors": artifact_errors,
        "determinism_score_present": determinism_score is not None,
        "modules": module_inventory,
    }


__all__ = ["check_pipeline_consistency", "normalize_modules", "TIER_SECTIONS"]
