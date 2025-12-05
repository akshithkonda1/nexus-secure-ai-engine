"""Mock trust layer for simulation."""
from __future__ import annotations

from typing import Dict, Iterable


class MockTrustLayer:
    """Lightweight evaluator that blocks simple forbidden keywords."""

    forbidden_keywords = {"danger", "hazard", "harm", "violent"}

    def evaluate(self, text: str | Iterable[str]) -> Dict[str, object]:
        samples = [text] if isinstance(text, str) else list(text)
        flagged = [s for s in samples if any(k in s.lower() for k in self.forbidden_keywords)]
        return {"safe": not flagged, "flagged": flagged}
