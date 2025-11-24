"""Monitors hallucination drift across responses using context anchors."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

from src.backend.utils.Logging import SafeLogger


@dataclass
class DriftSignal:
    """Represents hallucination drift signals from a generation."""

    drift_score: float
    anchors_missed: List[str]
    flagged: bool


class HallucinationDriftMonitor:
    """Scores how far a response drifts from provided context anchors."""

    def __init__(self, drift_threshold: float = 0.45) -> None:
        self.drift_threshold = drift_threshold
        self.logger = SafeLogger("ryuzen-drift-monitor")

    def evaluate(
        self,
        context_anchors: List[str],
        generated: str,
        metadata: Optional[Dict[str, str]] = None,
    ) -> DriftSignal:
        """Calculate drift score by counting missing anchors."""

        generated_lower = generated.lower()
        missed = [anchor for anchor in context_anchors if anchor.lower() not in generated_lower]
        anchor_penalty = min(1.0, len(missed) * 0.15)
        length_penalty = 0.0 if generated else 0.25
        drift_score = round(min(1.0, anchor_penalty + length_penalty), 3)
        flagged = drift_score >= self.drift_threshold

        tenant = (metadata or {}).get("tenant_id", "unknown")
        self.logger.info(
            "hallucination-drift",
            tenant_id=tenant,
            anchors=len(context_anchors),
            missed=len(missed),
            drift=drift_score,
            flagged=flagged,
        )
        return DriftSignal(drift_score=drift_score, anchors_missed=missed, flagged=flagged)


__all__ = ["HallucinationDriftMonitor", "DriftSignal"]
