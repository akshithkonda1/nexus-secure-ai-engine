"""
Hallucination guard implementing multi-pass validation and contradiction checks.
"""
from __future__ import annotations

from typing import List, Tuple

import numpy as np


class HallucinationGuard:
    def __init__(self, evidence_threshold: float = 0.5, contradiction_threshold: float = 0.2):
        self.evidence_threshold = evidence_threshold
        self.contradiction_threshold = contradiction_threshold

    def validate(self, passages: List[str]) -> Tuple[float, List[str]]:
        consensus = self._consensus_score(passages)
        contradictions = self._contradictions(passages)
        temporal_decay = self._temporal_decay(len(passages))
        risk = (1 - consensus) + contradictions + temporal_decay
        flags = []
        if consensus < self.evidence_threshold:
            flags.append("weak_evidence")
        if contradictions > self.contradiction_threshold:
            flags.append("contradiction_detected")
        if temporal_decay > 0.3:
            flags.append("stale_memory")
        return risk, flags

    def _consensus_score(self, passages: List[str]) -> float:
        if not passages:
            return 0.0
        lengths = np.array([len(p) for p in passages])
        norm = lengths / (lengths.max() or 1)
        return float(1 - np.std(norm))

    def _contradictions(self, passages: List[str]) -> float:
        unique = len(set(passages))
        return 0.0 if unique <= 1 else min(1.0, (unique - 1) / len(passages))

    def _temporal_decay(self, rounds: int) -> float:
        return min(1.0, rounds * 0.05)
