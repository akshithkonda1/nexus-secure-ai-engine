"""Lightweight abuse intent classifier to gate unsafe prompts."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

from src.backend.utils.Logging import SafeLogger


@dataclass
class AbuseClassification:
    """Represents abuse intent classification for a prompt."""

    category: str
    severity: float
    reasons: List[str]


class AbuseIntentClassifier:
    """Scores intent for abuse categories like violence, malware, and harassment."""

    def __init__(self, base_threshold: float = 0.45) -> None:
        self.base_threshold = base_threshold
        self.logger = SafeLogger("ryuzen-abuse-classifier")
        self._lexicon = {
            "violence": {"harm", "attack", "kill", "weapon", "assault"},
            "malware": {"payload", "exploit", "ransomware", "shellcode", "sqlmap"},
            "harassment": {"insult", "slur", "abuse", "dox", "hate"},
        }

    def classify(self, prompt: str, metadata: Optional[Dict[str, str]] = None) -> AbuseClassification:
        """Return a coarse intent classification without persisting prompt content."""

        lowered = prompt.lower()
        hits: List[str] = []
        category_scores: Dict[str, float] = {}
        for category, terms in self._lexicon.items():
            count = sum(term in lowered for term in terms)
            score = min(1.0, count * 0.2)
            if score:
                hits.append(category)
            category_scores[category] = score

        dominant_category = max(category_scores, key=category_scores.get)
        severity = category_scores[dominant_category]
        severity = max(severity, self.base_threshold if hits else 0.0)

        tenant = (metadata or {}).get("tenant_id", "unknown")
        self.logger.info(
            "abuse-intent",
            tenant_id=tenant,
            category=dominant_category,
            severity=round(severity, 3),
        )
        return AbuseClassification(category=dominant_category, severity=round(severity, 3), reasons=hits)


__all__ = ["AbuseIntentClassifier", "AbuseClassification"]
