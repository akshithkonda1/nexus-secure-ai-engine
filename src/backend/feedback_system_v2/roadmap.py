"""AI-generated roadmap builder from feature requests."""
from __future__ import annotations

from typing import Dict, List

from src.backend.feedback_system_v2.analyzer import FeedbackAnalyzer, get_analyzer


class RoadmapBuilder:
    def __init__(self, analyzer: FeedbackAnalyzer | None = None) -> None:
        self.analyzer = analyzer or get_analyzer()

    def build(self, feedback_items: List[str]) -> Dict[str, List[str]]:
        buckets = {"near_term": [], "mid_term": [], "long_term": []}
        for item in feedback_items:
            analysis = self.analyzer.analyze(item)
            text = analysis.summary or item
            if analysis.priority >= 4:
                buckets["near_term"].append(text)
            elif analysis.category == "feature_request":
                buckets["mid_term"].append(text)
            else:
                buckets["long_term"].append(text)
        return buckets


def get_roadmap_builder(analyzer: FeedbackAnalyzer | None = None) -> RoadmapBuilder:
    return RoadmapBuilder(analyzer)
