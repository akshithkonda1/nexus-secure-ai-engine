"""Heuristic detector for prompt poisoning and cross-tenant prompt leaks."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

from src.backend.utils.Logging import SafeLogger


@dataclass
class PoisoningResult:
    """Structured result describing the poisoning signal."""

    suspicious: bool
    score: float
    markers: List[str]
    reason: str


class PromptPoisoningDetector:
    """Detects prompt poisoning attempts before the model sees the payload."""

    def __init__(self, threshold: float = 0.35) -> None:
        self.threshold = threshold
        self.logger = SafeLogger("ryuzen-safety-poisoning")
        self._markers = [
            "ignore previous instructions",
            "you are now",
            "/bin/",
            "base64",
            "developer mode",
            "prompt injection",
            "anti-prompt",
            "sudo",
            "system override",
        ]

    def evaluate(self, prompt: str, metadata: Optional[Dict[str, str]] = None) -> PoisoningResult:
        """Return a poisoning score without persisting prompt content."""

        lowered = prompt.lower()
        hits = [marker for marker in self._markers if marker in lowered]
        entropy_score = min(1.0, len(prompt) / 8000)
        marker_score = min(1.0, len(hits) * 0.2)
        composite_score = round(min(1.0, entropy_score * 0.25 + marker_score), 3)
        suspicious = composite_score >= self.threshold

        tenant = (metadata or {}).get("tenant_id", "unknown")
        self.logger.info(
            "poisoning-scan",
            tenant_id=tenant,
            marker_count=len(hits),
            suspicious=suspicious,
        )
        reason = "markers detected" if hits else "entropy-only"
        return PoisoningResult(suspicious=suspicious, score=composite_score, markers=hits, reason=reason)


__all__ = ["PromptPoisoningDetector", "PoisoningResult"]
