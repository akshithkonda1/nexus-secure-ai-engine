"""Feedback analyzer built on ToronEngine.process."""
from __future__ import annotations

import statistics
from dataclasses import dataclass
from typing import Optional

from src.backend.feedback_system_v2.pii import remove_pii

try:  # Optional import
    from src.backend.core.toron.engine.toron_engine import ToronEngine
except Exception:  # pragma: no cover - fallback for limited environments
    ToronEngine = None  # type: ignore[misc]


@dataclass
class AnalysisResult:
    summary: str
    sentiment: str
    category: str
    priority: int


class FeedbackAnalyzer:
    def __init__(self, engine: ToronEngine | None = None) -> None:  # type: ignore[name-defined]
        self.engine = engine

    def _derive_sentiment(self, text: str) -> str:
        lowered = text.lower()
        if any(word in lowered for word in ["love", "great", "awesome", "good"]):
            return "positive"
        if any(word in lowered for word in ["hate", "terrible", "bad", "awful", "bug"]):
            return "negative"
        return "neutral"

    def _derive_category(self, text: str) -> str:
        lowered = text.lower()
        if "feature" in lowered:
            return "feature_request"
        if "bug" in lowered or "issue" in lowered:
            return "bug_report"
        if "performance" in lowered or "slow" in lowered:
            return "performance"
        return "general"

    def _score_priority(self, text: str) -> int:
        sentiment = self._derive_sentiment(text)
        score_map = {"negative": 4, "neutral": 3, "positive": 2}
        score = score_map.get(sentiment, 3)
        if "crash" in text.lower() or "outage" in text.lower():
            score = 5
        return max(1, min(score, 5))

    def analyze(self, text: str, *, session_id: Optional[str] = None) -> AnalysisResult:
        sanitized = remove_pii(text)
        if self.engine and hasattr(self.engine, "process"):
            try:
                response = self.engine.process(sanitized, user_id=session_id)
                if isinstance(response, dict) and "response" in response:
                    summary_text = str(response.get("response"))
                else:
                    summary_text = str(response)
            except Exception:
                summary_text = sanitized[:280]
        else:
            summary_text = sanitized[:280]

        sentiment = self._derive_sentiment(sanitized)
        category = self._derive_category(sanitized)
        priority = self._score_priority(sanitized)
        return AnalysisResult(summary=summary_text, sentiment=sentiment, category=category, priority=priority)

    @staticmethod
    def aggregate_priority(records: list[AnalysisResult]) -> float:
        priorities = [result.priority for result in records] or [0]
        return statistics.mean(priorities)


def get_analyzer(engine: ToronEngine | None = None) -> FeedbackAnalyzer:  # type: ignore[name-defined]
    return FeedbackAnalyzer(engine)
