"""Validation glue that leans on the trust layer when available."""
from __future__ import annotations

import importlib
import logging
from typing import Any, Dict, Iterable

_trust_spec = importlib.util.find_spec("ryuzen.trust")
HallucinationGuard = None
compute_risk = None
if _trust_spec:
    trust_module = importlib.import_module("ryuzen.trust")
    HallucinationGuard = getattr(trust_module, "HallucinationGuard", None)
    compute_risk = getattr(trust_module, "compute_risk", None)

logger = logging.getLogger(__name__)


class ValidationEngine:
    def __init__(self, enable_trust: bool = True):
        self.guard = HallucinationGuard() if (enable_trust and HallucinationGuard) else None

    def validate(self, passages: Iterable[str]) -> Dict[str, Any]:
        result: Dict[str, Any] = {"flags": []}

        if self.guard:
            try:
                guard_result = self.guard.validate(list(passages))
                result["hallucination"] = guard_result
            except Exception:
                logger.exception("Hallucination validation failed")

        if compute_risk:
            try:
                risk_input = {
                    "hallucination": result.get("hallucination", {}).get("risk", 0.0)
                    if isinstance(result.get("hallucination"), dict)
                    else 0.0,
                }
                result["risk"] = compute_risk(risk_input)
            except Exception:
                logger.exception("Risk computation failed")

        return result
