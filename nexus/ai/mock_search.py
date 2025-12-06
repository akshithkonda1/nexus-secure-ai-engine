"""Deterministic mock search provider used for simulation mode."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import List

from .toron_logger import get_logger, log_event

logger = get_logger("nexus.mock_search")


@dataclass
class MockSearchResult:
    source: str
    content: str


class MockSearchConnector:
    """Produce repeatable search results without network access."""

    def __init__(self) -> None:
        self.prefix = "toron:mock"

    def search(self, query: str, max_results: int = 3) -> List[MockSearchResult]:
        seed = hashlib.sha256(query.encode()).hexdigest()[:12]
        results = [
            MockSearchResult(source=f"{self.prefix}:{i}:{seed}", content=f"evidence {i} for {query}")
            for i in range(1, max_results + 1)
        ]
        log_event(logger, "mock.search", query=query, results=len(results))
        return results


__all__ = ["MockSearchConnector", "MockSearchResult"]
