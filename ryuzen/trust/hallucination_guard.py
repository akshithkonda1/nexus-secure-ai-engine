"""Safe wrapper for hallucination guard logic."""
from __future__ import annotations

import importlib
import logging
from typing import Iterable, Tuple

_guard_spec = importlib.util.find_spec("enterprise.trust.hallucination_guard")
_HallucinationGuard = None
if _guard_spec:
    _HallucinationGuard = importlib.import_module("enterprise.trust.hallucination_guard").HallucinationGuard

logger = logging.getLogger(__name__)


class HallucinationGuard:
    def __init__(self, *args, **kwargs):
        self._impl = _HallucinationGuard(*args, **kwargs) if _HallucinationGuard else None

    def evaluate(self, passages: Iterable[str]) -> dict | Tuple[float, list]:
        if self._impl:
            evaluate = getattr(self._impl, "evaluate", None)
            validate = getattr(self._impl, "validate", None)
            if callable(evaluate):
                return evaluate(list(passages))
            if callable(validate):
                risk, flags = validate(list(passages))  # type: ignore[misc]
                return {"risk": risk, "flags": flags}

        logger.debug("Hallucination guard not available; returning neutral signal")
        return {"risk": 0.0, "flags": []}

    def validate(self, passages: Iterable[str]):  # type: ignore[override]
        result = self.evaluate(passages)
        if isinstance(result, tuple):
            risk, flags = result
            return {"risk": risk, "flags": flags}
        return result
