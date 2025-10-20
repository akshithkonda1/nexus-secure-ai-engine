"""Shared helpers for entitlement configuration."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict


_ENTITLEMENTS_PATH = Path(__file__).resolve().parent / "config" / "entitlements.json"


@lru_cache(maxsize=1)
def load_entitlements() -> Dict[str, Dict[str, Any]]:
    with _ENTITLEMENTS_PATH.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data


def entitlement_for(tier: str) -> Dict[str, Any]:
    entitlements = load_entitlements()
    return entitlements.get(tier, {})


__all__ = ["load_entitlements", "entitlement_for"]
