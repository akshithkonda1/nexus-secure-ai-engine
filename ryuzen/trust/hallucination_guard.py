"""Lightweight heuristics for hallucination detection.

The implementation intentionally avoids external dependencies so the
module can be exercised in isolated CI environments. The goal is to
provide deterministic, explainable decisions that can be replaced with a
more sophisticated model later.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Sequence
import re


@dataclass
class HallucinationResult:
    """Outcome of a hallucination evaluation."""

    flagged: bool
    score: float
    reasons: List[str] = field(default_factory=list)


class HallucinationGuard:
    """Applies simple lexical checks to responses.

    The guard looks for obvious placeholders and measures the lexical
    overlap between the prompt and the response. Low overlap or the
    presence of unsupported placeholders is treated as a potential
    hallucination, providing deterministic signals for tests.
    """

    def __init__(self, banned_tokens: Sequence[str] | None = None, threshold: float = 0.35):
        self.banned_tokens = tuple(token.lower() for token in banned_tokens or ("{{", "}}", "<noinput>"))
        self.threshold = threshold

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return [token.lower() for token in re.findall(r"[A-Za-z0-9']+", text)]

    def evaluate(self, prompt: str, response: str) -> HallucinationResult:
        prompt_tokens = self._tokenize(prompt)
        response_tokens = self._tokenize(response)

        if not response_tokens:
            return HallucinationResult(flagged=True, score=1.0, reasons=["Empty response"])

        overlap = 0
        for token in set(response_tokens):
            if token in prompt_tokens:
                overlap += response_tokens.count(token)

        overlap_score = overlap / max(len(response_tokens), 1)
        reasons: List[str] = []

        for token in self.banned_tokens:
            if token and token in response.lower():
                reasons.append(f"Found banned token '{token}'")

        if overlap_score < self.threshold:
            reasons.append("Low lexical overlap between prompt and response")

        flagged = bool(reasons)
        score = min(1.0, 1.0 - overlap_score)
        return HallucinationResult(flagged=flagged, score=score, reasons=reasons)
