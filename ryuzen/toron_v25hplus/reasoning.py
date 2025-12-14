"""Logic detection using zero-shot classification."""

from __future__ import annotations

import threading
from dataclasses import dataclass
from typing import Sequence


REASONING_LABELS = [
    "requires deductive reasoning",
    "causal reasoning",
    "logical inference",
]


@dataclass
class ReasoningSignal:
    requires_reasoning: bool
    confidence: float


class LogicDetector:
    def __init__(self, threshold: float = 0.55, model_name: str = "facebook/bart-large-mnli") -> None:
        self.threshold = threshold
        self.model_name = model_name
        self._pipeline = None
        self._lock = threading.Lock()

    def _load_pipeline(self):
        if self._pipeline is None:
            with self._lock:
                if self._pipeline is None:
                    try:
                        from transformers import pipeline

                        self._pipeline = pipeline("zero-shot-classification", model=self.model_name)
                    except Exception as exc:  # pragma: no cover - dependency only loaded in production
                        raise RuntimeError("transformers is required for logic detection") from exc
        return self._pipeline

    def analyse(self, text: str) -> ReasoningSignal:
        classifier = self._load_pipeline()
        result = classifier(text, candidate_labels=REASONING_LABELS)
        scores = result.get("scores", [])
        top_score = float(scores[0]) if scores else 0.0
        requires_reasoning = top_score >= self.threshold
        return ReasoningSignal(requires_reasoning=requires_reasoning, confidence=top_score)

