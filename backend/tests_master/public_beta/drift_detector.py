"""Model drift detector for Ryuzen Toron v2.5H+ public beta."""
from dataclasses import dataclass
from typing import Dict, List


@dataclass
class DriftComparison:
    """Comparison between two model versions."""

    baseline_version: str
    candidate_version: str
    average_delta: float
    instability_detected: bool


@dataclass
class DriftReport:
    """Summary of drift analysis and routing recommendations."""

    comparisons: List[DriftComparison]
    recommended_routing: str

    def as_dict(self) -> Dict[str, object]:
        return {
            "comparisons": [comparison.__dict__ for comparison in self.comparisons],
            "recommended_routing": self.recommended_routing,
        }


class ModelDriftDetector:
    """Analyzes Tier 1 model outputs and recommends routing adjustments."""

    def __init__(self, instability_threshold: float = 0.12) -> None:
        self.instability_threshold = instability_threshold

    def _delta(self, baseline: List[float], candidate: List[float]) -> DriftComparison:
        paired = zip(baseline, candidate)
        deltas = [abs(a - b) for a, b in paired]
        average_delta = round(sum(deltas) / len(deltas), 4) if deltas else 0.0
        instability_detected = average_delta > self.instability_threshold
        return DriftComparison(
            baseline_version="tier1-baseline",
            candidate_version="tier1-candidate",
            average_delta=average_delta,
            instability_detected=instability_detected,
        )

    def detect(self, baseline_outputs: List[float], candidate_outputs: List[float]) -> DriftReport:
        comparison = self._delta(baseline_outputs, candidate_outputs)
        if comparison.instability_detected:
            recommended_routing = "Route 70% baseline / 30% candidate until stability improves."
        else:
            recommended_routing = "Allow candidate to receive majority Tier 1 traffic."
        return DriftReport(comparisons=[comparison], recommended_routing=recommended_routing)
