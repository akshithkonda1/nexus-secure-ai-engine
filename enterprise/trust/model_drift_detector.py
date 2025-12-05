"""
Model drift detection using sliding windows and divergence metrics.
"""
from __future__ import annotations

from collections import deque
from typing import Deque, List

import numpy as np


class ModelDriftDetector:
    def __init__(self, window_size: int = 50, alert_threshold: float = 0.3):
        self.window_size = window_size
        self.alert_threshold = alert_threshold
        self.reference: Deque[np.ndarray] = deque(maxlen=window_size)
        self.recent: Deque[np.ndarray] = deque(maxlen=window_size)

    def add_reference(self, vector: List[float]) -> None:
        self.reference.append(np.array(vector))

    def observe(self, vector: List[float]) -> bool:
        self.recent.append(np.array(vector))
        if len(self.recent) < self.window_size // 2 or not self.reference:
            return False
        drift_score = self._cosine_drift()
        return drift_score > self.alert_threshold

    def _cosine_drift(self) -> float:
        ref_mean = np.mean(np.stack(self.reference), axis=0)
        recent_mean = np.mean(np.stack(self.recent), axis=0)
        numerator = float(np.dot(ref_mean, recent_mean))
        denom = float(np.linalg.norm(ref_mean) * np.linalg.norm(recent_mean)) or 1.0
        cosine = numerator / denom
        return 1 - cosine

    def kl_divergence(self) -> float:
        if len(self.reference) < 2 or len(self.recent) < 2:
            return 0.0
        ref_hist, _ = np.histogram(np.concatenate(self.reference), bins=20, density=True)
        recent_hist, _ = np.histogram(np.concatenate(self.recent), bins=20, density=True)
        ref_hist += 1e-9
        recent_hist += 1e-9
        return float(np.sum(recent_hist * np.log(recent_hist / ref_hist)))

    def anomaly_window(self) -> float:
        return self._cosine_drift() + self.kl_divergence()
