"""Tier extraction utilities resilient to Toron engine changes."""
from __future__ import annotations

import re
from typing import Any, Dict, List


def _listify(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _infer_tiers(payload: Dict[str, Any]) -> List[str]:
    for key in ("tiers", "tier_path", "path", "route"):
        if key in payload and payload[key]:
            return _listify(payload[key])

    textual = str(payload.get("response", ""))
    found = re.findall(r"T[1-4]", textual)
    return found if found else []


def _infer_opus(payload: Dict[str, Any]) -> bool:
    for key in ("opus", "opus_used", "opus_mode"):
        if key in payload:
            return bool(payload[key])
    textual = str(payload.get("response", ""))
    return "opus" in textual.lower()


def _infer_flags(payload: Dict[str, Any]) -> List[str]:
    flags = []
    for key in ("flags", "meta_flags", "meta_surveillance_flags"):
        value = payload.get(key)
        if value:
            flags.extend(_listify(value))
    textual = str(payload.get("response", ""))
    if re.search(r"ALOE", textual, re.IGNORECASE):
        flags.append("ALOE")
    return list(dict.fromkeys(flags))


def _infer_contradictions(payload: Dict[str, Any]) -> int:
    for key in ("contradictions", "contradiction_count", "contradiction"):
        if key in payload:
            try:
                return int(payload[key])
            except Exception:
                continue
    textual = str(payload.get("response", ""))
    return textual.lower().count("contradiction")


def _infer_confidence(payload: Dict[str, Any]) -> float | None:
    for key in ("confidence", "confidence_score", "score"):
        if key in payload:
            try:
                return float(payload[key])
            except Exception:
                return None
    return None


def extract_tier_info(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize tier-related details from varied Toron payloads."""
    tiers = _infer_tiers(payload)
    return {
        "tier_path": tiers,
        "opus_used": _infer_opus(payload),
        "flags": _infer_flags(payload),
        "contradictions": _infer_contradictions(payload),
        "confidence": _infer_confidence(payload),
    }


__all__ = ["extract_tier_info"]
