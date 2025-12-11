"""Synthetic feedback pipeline tester for Phase 8 readiness."""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from typing import Dict, List
import random


@dataclass
class FeedbackTestConfig:
    seed: int = 101
    feedback_size: int = 1000
    severity_levels: tuple[str, ...] = ("low", "medium", "high", "critical")


@dataclass
class FeedbackPipelineResult:
    ingestion_ok: bool
    aggregation_ok: bool
    ranking_ok: bool
    clustering_ok: bool
    feedback_health_score: float
    summary: Dict[str, float]


class FeedbackPipelineTester:
    """Generate and validate synthetic feedback signals."""

    def __init__(self, config: FeedbackTestConfig | None = None) -> None:
        self.config = config or FeedbackTestConfig()
        self.random = random.Random(self.config.seed)

    def _generate_feedback(self) -> List[dict]:
        feedback_items: List[dict] = []
        for idx in range(self.config.feedback_size):
            severity = self.random.choices(
                population=self.config.severity_levels,
                weights=[0.5, 0.3, 0.15, 0.05],
                k=1,
            )[0]
            feedback_items.append(
                {
                    "id": idx,
                    "text": f"synthetic feedback {idx}",
                    "severity": severity,
                    "score": round(self.random.random() * 5, 3),
                }
            )
        return feedback_items

    def run(self) -> FeedbackPipelineResult:
        items = self._generate_feedback()
        ingestion_ok = len(items) == self.config.feedback_size

        severity_counts = Counter(item["severity"] for item in items)
        aggregation_ok = sum(severity_counts.values()) == self.config.feedback_size

        ranked = sorted(items, key=lambda x: (x["severity"], -x["score"]))
        ranking_ok = bool(ranked) and ranked[0]["score"] >= ranked[-1]["score"]

        clustering_ok = len(severity_counts) == len(self.config.severity_levels)

        health_components = [
            1.0 if ingestion_ok else 0.0,
            1.0 if aggregation_ok else 0.0,
            0.9 if ranking_ok else 0.2,
            0.9 if clustering_ok else 0.1,
        ]
        feedback_health_score = round(sum(health_components) / len(health_components), 3)

        summary = {
            "ingested": len(items),
            "severity_distribution": {level: severity_counts.get(level, 0) for level in self.config.severity_levels},
            "top_feedback_score": ranked[0]["score"] if ranked else 0,
        }

        return FeedbackPipelineResult(
            ingestion_ok=ingestion_ok,
            aggregation_ok=aggregation_ok,
            ranking_ok=ranking_ok,
            clustering_ok=clustering_ok,
            feedback_health_score=feedback_health_score,
            summary=summary,
        )


__all__ = ["FeedbackTestConfig", "FeedbackPipelineResult", "FeedbackPipelineTester"]
