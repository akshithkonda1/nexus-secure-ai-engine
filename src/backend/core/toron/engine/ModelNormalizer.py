from __future__ import annotations

from typing import Dict, Tuple

from nexus.ai.nexus_engine import _sanitize_model_output


class ModelNormalizer:
    """Normalize and score model outputs using existing sanitization hooks."""

    def normalize(self, text: str) -> str:
        return _sanitize_model_output(text or "")

    def score(self, text: str) -> Tuple[float, float]:
        sanitized = self.normalize(text)
        hallucination_score = 0.0 if sanitized else 1.0
        confidence = max(0.0, 1.0 - hallucination_score)
        return confidence, hallucination_score

    def normalize_payload(self, payload: Dict[str, str]) -> Dict[str, str]:
        return {k: self.normalize(v) for k, v in payload.items()}


__all__ = ["ModelNormalizer"]
