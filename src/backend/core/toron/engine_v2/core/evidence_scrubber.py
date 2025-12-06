"""EvidenceScrubber module for extracting factual claims from model outputs."""

from __future__ import annotations

import logging
import re
from typing import Iterable, List

logger = logging.getLogger(__name__)


class EvidenceScrubber:
    """Extract factual claims from raw model outputs.

    This scrubs a list of raw strings (model outputs) into a de-duplicated,
    heuristically-filtered list of candidate factual claims.
    """

    SENTENCE_SPLIT_REGEX = re.compile(
        r"(?<=[.!?])\s+|^-\s+|\n+",
        re.VERBOSE | re.MULTILINE,
    )
    KEYWORD_HINTS = (
        " is ", " are ", " was ", " were ", " has ", " have ", " reported",
        " according ", " states ", " shows ", " estimates ", " launched ",
        " released ", " announced ", " founded ", " percent", " million",
    )

    def __init__(self, max_claims: int = 10) -> None:
        self.max_claims = max(1, int(max_claims))

    def extract_claims(self, outputs: Iterable[str]) -> List[str]:
        """Extract a list of factual claims from model outputs.

        Args:
            outputs: Iterable of raw model output strings.

        Returns:
            A de-duplicated list of candidate claims limited by ``max_claims``.
        """

        claims: List[str] = []
        seen_lower = set()

        if outputs is None:
            logger.warning("EvidenceScrubber received None outputs; returning empty list")
            return claims

        for raw in outputs:
            if not raw:
                continue
            try:
                text = str(raw).strip()
            except Exception as exc:  # pragma: no cover - defensive
                logger.debug("Failed to coerce output to string: %s", exc)
                continue

            if not text:
                continue

            segments = [seg.strip() for seg in self.SENTENCE_SPLIT_REGEX.split(text) if seg]
            for seg in segments:
                if not self._looks_like_claim(seg):
                    continue
                normalized = self._normalize(seg)
                if normalized in seen_lower:
                    continue
                seen_lower.add(normalized)
                claims.append(seg.strip())
                if len(claims) >= self.max_claims:
                    logger.debug("Reached max_claims=%s; stopping extraction", self.max_claims)
                    return claims

        return claims

    def _looks_like_claim(self, sentence: str) -> bool:
        """Heuristic filter to decide if a sentence resembles a claim."""

        if not sentence:
            return False

        clean = sentence.strip()
        if len(clean) < 20 or len(clean) > 400:
            return False

        if not re.search(r"[a-zA-Z]", clean):
            return False

        if any(keyword in clean.lower() for keyword in self.KEYWORD_HINTS):
            return True

        # Fallback: include sentences with numbers or proper nouns structure
        has_number = bool(re.search(r"\d", clean))
        capitalized_words = len(re.findall(r"\b[A-Z][a-z]+\b", clean))
        return has_number or capitalized_words >= 2

    @staticmethod
    def _normalize(text: str) -> str:
        return re.sub(r"\s+", " ", text.strip()).lower()
