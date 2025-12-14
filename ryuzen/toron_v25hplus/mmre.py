"""Minimal MMRE v0 implementation using evidence density estimation."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Dict, Iterable, List

import requests

logger = logging.getLogger(__name__)


@dataclass
class EvidencePacket:
    verified_facts: List[str]
    conflicts_detected: List[str]
    evidence_density: float
    escalation_required: bool


class MMREngine:
    """Evidence-density-based MMRE engine.

    This implementation issues a lightweight web search and counts how many
    snippets support or conflict with the provided claims. It never asserts
    ground truth, only reports the density of supporting evidence.
    """

    def __init__(self, max_results: int = 5) -> None:
        self.max_results = max_results

    def _search(self, query: str) -> List[str]:
        try:
            response = requests.get(
                "https://duckduckgo.com/html/", params={"q": query}, timeout=5
            )
            response.raise_for_status()
            return re.findall(r'<a[^>]+class="result__a"[^>]*>(.*?)</a>', response.text)[: self.max_results]
        except Exception as exc:  # pragma: no cover - network dependent
            logger.warning("MMR search failed: %s", exc)
            return []

    def evaluate_claims(self, claims: Iterable[str]) -> EvidencePacket:
        verified: List[str] = []
        conflicts: List[str] = []
        density = 0.0
        total = 0
        for claim in claims:
            snippets = self._search(claim)
            total += 1
            if snippets:
                density += min(1.0, len(snippets) / float(self.max_results))
                verified.append(claim)
            else:
                conflicts.append(claim)
        evidence_density = density / total if total else 0.0
        escalation_required = evidence_density < 0.4 or bool(conflicts)
        return EvidencePacket(
            verified_facts=verified,
            conflicts_detected=conflicts,
            evidence_density=evidence_density,
            escalation_required=escalation_required,
        )

