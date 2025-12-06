"""EvidenceInjector validates claims using a pluggable search connector."""

from __future__ import annotations

import logging
from typing import Callable, Dict, Iterable, List

from .search_connector import SearchError, SearchResult

logger = logging.getLogger(__name__)


class EvidenceInjector:
    """Verify claims via web search and structure the results."""

    MAX_TEXT_LEN = 800

    def verify_claims(
        self, claims: Iterable[str], search_fn: Callable[[str], SearchResult]
    ) -> List[Dict[str, object]]:
        """Verify each claim using the provided search function.

        Args:
            claims: Iterable of claim strings to verify.
            search_fn: Callable that accepts a claim and returns ``SearchResult``.

        Returns:
            List of dictionaries containing claim verification results.
        """

        results: List[Dict[str, object]] = []
        if not claims:
            return results

        seen = set()
        for claim in claims:
            if not claim:
                continue
            trimmed_claim = str(claim).strip()[: self.MAX_TEXT_LEN]
            if not trimmed_claim:
                continue

            normalized = trimmed_claim.lower()
            if normalized in seen:
                continue
            seen.add(normalized)

            try:
                search_result = search_fn(trimmed_claim)
                verified_entry = self._build_result(trimmed_claim, search_result, True)
                results.append(verified_entry)
            except SearchError as exc:
                logger.warning("Search failed for claim: %s", exc)
                results.append(self._build_result(trimmed_claim, None, False, str(exc)))
            except Exception as exc:  # pragma: no cover - defensive
                logger.error("Unexpected error verifying claim '%s': %s", trimmed_claim, exc)
                results.append(self._build_result(trimmed_claim, None, False, "Unexpected error"))

        return results

    def _build_result(
        self,
        claim: str,
        search_result: SearchResult | None,
        verified: bool,
        error: str | None = None,
    ) -> Dict[str, object]:
        evidence_text = ""
        source_url = ""

        if search_result:
            evidence_text = str(search_result.content or "")[: self.MAX_TEXT_LEN]
            source_url = str(search_result.url or "")

        return {
            "claim": claim,
            "verified": bool(verified and bool(evidence_text)),
            "evidence": evidence_text,
            "source": source_url,
            "error": error or "",
        }
