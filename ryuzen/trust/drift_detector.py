"""Baseline drift detection utilities."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class DriftReport:
    drifted: bool
    deltas: Dict[str, float] = field(default_factory=dict)
    threshold: float = 0.0


class DriftDetector:
    """Compare live metrics against a predefined baseline.

    The detector computes absolute percentage differences for numeric
    metrics. If any metric exceeds the configured tolerance the report is
    marked as drifted. No external state is required, keeping behavior
    deterministic for tests.
    """

    def __init__(self, baseline: Dict[str, float] | None = None, tolerance: float = 0.1):
        self.baseline = dict(baseline or {})
        self.tolerance = tolerance

    def detect(self, metrics: Dict[str, float]) -> DriftReport:
        deltas: Dict[str, float] = {}
        drifted = False
        for key, base_value in self.baseline.items():
            if key not in metrics:
                continue
            current = metrics[key]
            if base_value == 0:
                delta = float("inf") if current != 0 else 0.0
            else:
                delta = abs(current - base_value) / abs(base_value)
            deltas[key] = delta
            if delta > self.tolerance:
                drifted = True

        return DriftReport(drifted=drifted, deltas=deltas, threshold=self.tolerance)
