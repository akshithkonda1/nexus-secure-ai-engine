"""Risk scoring shim that delegates when available."""
from __future__ import annotations

import importlib
import logging
from typing import Dict

_risk_spec = importlib.util.find_spec("enterprise.trust.risk_scoring")
_compute_risk = None
if _risk_spec:
    _compute_risk = importlib.import_module("enterprise.trust.risk_scoring").compute_risk

logger = logging.getLogger(__name__)


def compute_risk(inputs: Dict[str, float]) -> Dict[str, object]:
    if _compute_risk:
        return _compute_risk(inputs)

    logger.debug("Risk scoring fallback engaged")
    score = sum(inputs.values())
    return {"score": round(score, 3), "label": "unknown"}
