"""Semantic similarity helpers for contradiction detection."""

from __future__ import annotations

import math
import threading
from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, Iterable, List, Sequence, Tuple

import numpy as np


@dataclass(frozen=True)
class ClaimEmbedding:
    text: str
    vector: np.ndarray


class SemanticContradictionDetector:
    """Detect contradictions using sentence embeddings rather than string matching."""

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> None:
        self.model_name = model_name
        self._model = None
        self._lock = threading.Lock()

    def _load_model(self):
        if self._model is None:
            with self._lock:
                if self._model is None:
                    try:
                        from sentence_transformers import SentenceTransformer

                        self._model = SentenceTransformer(self.model_name)
                    except Exception as exc:  # pragma: no cover - executed only when model missing
                        raise RuntimeError(
                            "SentenceTransformer dependency is required for semantic contradiction detection"
                        ) from exc
        return self._model

    @lru_cache(maxsize=512)
    def embed(self, text: str) -> np.ndarray:
        model = self._load_model()
        return np.array(model.encode([text])[0])

    def cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        denom = (math.sqrt(float(np.dot(a, a))) * math.sqrt(float(np.dot(b, b)))) or 1e-12
        return float(np.dot(a, b) / denom)

    def find_disagreements(self, claims: Sequence[Tuple[str, str]]) -> Tuple[List[str], float]:
        """Return disagreements and disagreement rate.

        Args:
            claims: Sequence of tuples ``(claim_text, label)``.

        Returns:
            contradictions: list of claim descriptions that disagree.
            disagreement_rate: ratio of disagreements to comparisons.
        """

        contradictions: List[str] = []
        comparisons = 0
        for idx, (claim_a, label_a) in enumerate(claims):
            emb_a = self.embed(claim_a)
            for claim_b, label_b in claims[idx + 1 :]:
                emb_b = self.embed(claim_b)
                similarity = self.cosine_similarity(emb_a, emb_b)
                comparisons += 1
                if similarity < 0.85:
                    contradictions.append(f"semantic divergence: {claim_a} ↔ {claim_b}")
                elif label_a != label_b:
                    contradictions.append(f"label conflict: {claim_a} ↔ {claim_b}")
        rate = float(len(contradictions)) / comparisons if comparisons else 0.0
        return contradictions, rate

