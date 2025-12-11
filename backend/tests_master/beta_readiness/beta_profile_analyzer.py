"""Beta profile analyzer for Phase 8 controlled readiness."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict


@dataclass
class BetaProfile:
    projected_dau: int
    risk_zones: Dict[str, str]
    slow_tiers: Dict[str, float]
    opus_overuse_probability: float


@dataclass
class BetaReadinessScore:
    score: float
    rationale: str


class BetaProfileAnalyzer:
    """Analyze readiness based on simulated usage, billing, and feedback signals."""

    def __init__(self) -> None:
        self.thresholds = {
            "latency_p95_ms": 500,
            "error_rate": 0.02,
            "model_escalation_frequency": 0.25,
        }

    def analyze(self, student_profile: Dict[str, float], feedback_health_score: float, billing_report: Dict[str, bool]) -> BetaReadinessScore:
        projected_dau = int(student_profile.get("total_requests", 0) * 1.3)

        risk_zones = {
            "latency": "elevated" if student_profile.get("latency_p95_ms", 0) > self.thresholds["latency_p95_ms"] else "stable",
            "reliability": "at-risk" if student_profile.get("error_rate", 0) > self.thresholds["error_rate"] else "healthy",
            "escalation": "watch" if student_profile.get("model_escalation_frequency", 0) > self.thresholds["model_escalation_frequency"] else "nominal",
        }

        slow_tiers = {
            tier: latency
            for tier, latency in student_profile.items()
            if tier.startswith("share_") and latency > 0.25
        }

        opus_overuse_probability = round(max(student_profile.get("share_STEM_essays", 0), student_profile.get("share_exam_prep_prompts", 0)) * 0.6, 3)

        billing_pass_rate = sum(billing_report.values()) / max(len(billing_report), 1)
        readiness_components = [
            1 - min(1.0, student_profile.get("error_rate", 0)),
            1 - min(1.0, student_profile.get("model_escalation_frequency", 0)),
            feedback_health_score / 1.0,
            billing_pass_rate,
        ]
        score = round(sum(readiness_components) / len(readiness_components), 3)

        rationale = (
            f"Projected DAU: {projected_dau}; "
            f"Latency risk: {risk_zones['latency']}; "
            f"Reliability: {risk_zones['reliability']}; "
            f"Billing adherence: {billing_pass_rate:.2f}; "
            f"Feedback health: {feedback_health_score:.2f}"
        )

        return BetaReadinessScore(score=score, rationale=rationale)


__all__ = ["BetaProfileAnalyzer", "BetaProfile", "BetaReadinessScore"]
