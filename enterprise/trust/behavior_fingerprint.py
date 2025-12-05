"""
Behavioral fingerprinting engine capturing statistical and semantic signals.
"""
from __future__ import annotations

import math
from collections import Counter
from hashlib import blake2b
from typing import Dict, List

import numpy as np
from pydantic import BaseModel


class BehaviorSignature(BaseModel):
    token_entropy: float
    semantic_drift: float
    error_cluster_density: float
    answer_shape: Dict[str, int]
    temperature_stability: float
    provider_vector: str

    def fingerprint(self) -> str:
        h = blake2b(digest_size=32)
        h.update(str(self.dict()).encode())
        return h.hexdigest()


class BehavioralFingerprintEngine:
    def __init__(self, provider: str, model: str, baseline: BehaviorSignature | None = None):
        self.provider = provider
        self.model = model
        self.baseline = baseline

    def _token_entropy(self, tokens: List[str]) -> float:
        counts = Counter(tokens)
        total = sum(counts.values()) or 1
        return -sum((c / total) * math.log2(c / total) for c in counts.values())

    def _semantic_drift(self, embeddings: List[List[float]]) -> float:
        if len(embeddings) < 2:
            return 0.0
        vecs = np.array(embeddings)
        baseline = vecs.mean(axis=0)
        drift = np.linalg.norm(vecs[-1] - baseline)
        return float(drift)

    def _error_cluster_density(self, errors: List[str]) -> float:
        if not errors:
            return 0.0
        counts = Counter(errors)
        dominant = counts.most_common(1)[0][1]
        return dominant / len(errors)

    def _answer_shape(self, text: str) -> Dict[str, int]:
        return {
            "sentences": text.count("."),
            "paragraphs": text.count("\n\n") + 1,
            "bullet_points": text.count("- "),
        }

    def _temperature_stability(self, outputs: List[str]) -> float:
        if len(outputs) < 2:
            return 1.0
        lengths = [len(o) for o in outputs]
        return float(1 / (1 + np.std(lengths)))

    def analyze(self, tokens: List[str], text: str, embeddings: List[List[float]], errors: List[str], outputs: List[str]) -> BehaviorSignature:
        signature = BehaviorSignature(
            token_entropy=self._token_entropy(tokens),
            semantic_drift=self._semantic_drift(embeddings),
            error_cluster_density=self._error_cluster_density(errors),
            answer_shape=self._answer_shape(text),
            temperature_stability=self._temperature_stability(outputs),
            provider_vector=f"{self.provider}:{self.model}",
        )
        return signature

    def detect_change(self, signature: BehaviorSignature) -> bool:
        if not self.baseline:
            return False
        delta = abs(signature.token_entropy - self.baseline.token_entropy)
        drift_gap = abs(signature.semantic_drift - self.baseline.semantic_drift)
        stability_drop = self.baseline.temperature_stability - signature.temperature_stability
        return delta > 0.5 or drift_gap > 0.25 or stability_drop > 0.2
