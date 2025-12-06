"""Inject verified evidence for extracted claims."""

from __future__ import annotations

import time
from typing import Dict, List

from .search_connector import SearchConnector
from .toron_logger import get_logger, log_event

logger = get_logger("nexus.injector")


class EvidenceInjector:
    """Verify claims via the search connector and return structured results."""

    def __init__(self, connector: SearchConnector) -> None:
        self.connector = connector

    def verify_claims(self, claims: List[str]) -> List[Dict[str, object]]:
        """Verify each claim and attach evidence payloads."""

        verified: List[Dict[str, object]] = []
        for claim in claims:
            start = time.perf_counter()
            log_event(logger, "injector.search", claim=claim)
            evidence = self.connector.search(claim)
            latency = time.perf_counter() - start
            verified.append(
                {
                    "claim": claim,
                    "evidence": evidence,
                    "latency": latency,
                    "verified": bool(evidence and evidence[0].get("source") != "toron:fallback"),
                }
            )
        log_event(logger, "injector.done", total=len(verified))
        return verified


__all__ = ["EvidenceInjector"]
