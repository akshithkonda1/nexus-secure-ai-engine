"""Extract verifiable factual claims from free-form text."""

from __future__ import annotations

import re
from typing import List, Set

from .toron_logger import get_logger, log_event

logger = get_logger("nexus.scrubber")

_SENTENCE_BOUNDARY = re.compile(r"(?<=[\.!?])\s+")
_CLAIM_PATTERN = re.compile(
    r"([A-Z][^.?!]{10,}?\b(?:is|are|was|were|has|have|claims|reports|states)\b[^.?!]{5,}?[\.\?!])",
    flags=re.IGNORECASE,
)


def _normalise(text: str) -> str:
    """Normalise whitespace in a candidate claim."""

    text = re.sub(r"\s+", " ", text).strip()
    return text


class EvidenceScrubber:
    """Lightweight heuristic claim extractor.

    The extractor identifies sentence-like fragments containing verbs that
    commonly accompany factual statements. Up to ten unique claims are
    returned to keep verification budgets bounded.
    """

    max_claims: int = 10

    def extract(self, text: str) -> List[str]:
        """Return a list of deduplicated claims discovered in ``text``."""

        if not text:
            return []
        log_event(logger, "scrubber.start", length=len(text))
        candidates: Set[str] = set()
        for sentence in _SENTENCE_BOUNDARY.split(text):
            sentence = sentence.strip()
            if not sentence or len(sentence) < 20:
                continue
            for match in _CLAIM_PATTERN.findall(sentence + "."):
                claim = _normalise(match)
                if claim and claim not in candidates:
                    candidates.add(claim)
                if len(candidates) >= self.max_claims:
                    break
            if len(candidates) >= self.max_claims:
                break
        claims = list(candidates)[: self.max_claims]
        log_event(logger, "scrubber.done", claims=len(claims))
        return claims


__all__ = ["EvidenceScrubber"]
