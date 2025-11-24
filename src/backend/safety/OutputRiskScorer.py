"""Scores model outputs for residual risk and policy alignment."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional

from src.backend.utils.Logging import SafeLogger


@dataclass
class RiskScore:
    """Composite risk score for a model output."""

    value: float
    risk_band: str
    safety_shaping: bool


class OutputRiskScorer:
    """Combines upstream safety signals into an actionable risk score."""

    def __init__(self, high_risk_threshold: float = 0.6, medium_risk_threshold: float = 0.35) -> None:
        self.high_risk_threshold = high_risk_threshold
        self.medium_risk_threshold = medium_risk_threshold
        self.logger = SafeLogger("ryuzen-output-risk")

    def score_inputs(
        self,
        prompt: str,
        poisoning_score: float,
        abuse_severity: float,
        metadata: Optional[Dict[str, str]] = None,
    ) -> RiskScore:
        """Compute a risk score before generation occurs."""

        semantic_length = min(1.0, len(prompt) / 4096)
        base_score = max(poisoning_score, abuse_severity)
        composite = round(min(1.0, 0.4 * semantic_length + 0.6 * base_score), 3)

        risk_band = "low"
        safety_shaping = False
        if composite >= self.high_risk_threshold:
            risk_band = "high"
            safety_shaping = True
        elif composite >= self.medium_risk_threshold:
            risk_band = "medium"
            safety_shaping = True

        tenant = (metadata or {}).get("tenant_id", "unknown")
        self.logger.info(
            "output-risk",
            tenant_id=tenant,
            risk=composite,
            band=risk_band,
            shaped=safety_shaping,
        )
        return RiskScore(value=composite, risk_band=risk_band, safety_shaping=safety_shaping)


__all__ = ["OutputRiskScorer", "RiskScore"]
