"""Model drift detector shim."""
from __future__ import annotations

import importlib
import logging
from typing import List

_drift_spec = importlib.util.find_spec("enterprise.trust.model_drift_detector")
_ModelDriftDetector = None
if _drift_spec:
    _ModelDriftDetector = importlib.import_module("enterprise.trust.model_drift_detector").ModelDriftDetector

logger = logging.getLogger(__name__)


class ModelDriftDetector:
    def __init__(self, window_size: int = 50, alert_threshold: float = 0.3):
        self._impl = _ModelDriftDetector(window_size, alert_threshold) if _ModelDriftDetector else None
        self.window_size = window_size
        self.alert_threshold = alert_threshold
        self.reference: list = []
        self.recent: list = []

    def add_reference(self, vector: List[float]) -> None:
        if self._impl:
            return self._impl.add_reference(vector)
        self.reference.append(vector)

    def observe(self, vector: List[float]) -> bool:
        if self._impl:
            return self._impl.observe(vector)
        self.recent.append(vector)
        if len(self.recent) < self.window_size // 2 or not self.reference:
            return False
        logger.debug("Drift detector fallback: insufficient data for real metric, returning False")
        return False
