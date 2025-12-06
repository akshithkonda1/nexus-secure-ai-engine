"""Connector for Tavily web search with robust error handling and engine guards."""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional

import requests

logger = logging.getLogger(__name__)


class SearchError(Exception):
    """Wrapper for all search-related failures."""


@dataclass
class SearchResult:
    """Structured search result."""

    content: str
    url: str
    score: float


class SearchConnector:
    """Lightweight Tavily API client with retries and validation."""

    SEARCH_URL = "https://api.tavily.com/search"

    def __init__(self, api_key: Optional[str] = None, timeout: float = 8.0, engine: Optional[Any] = None) -> None:
        self.api_key = api_key or os.getenv("TAVILY_API_KEY")
        self.timeout = timeout
        self.engine = engine
        self._assert_engine_ready()

    def bind_engine(self, engine: Any) -> None:
        """Bind the connector to an initialized engine."""
        self.engine = engine
        self._assert_engine_ready()

    def _assert_engine_ready(self) -> None:
        if self.engine is None:
            return
        initialized = getattr(self.engine, "initialized", False)
        if not initialized:
            raise SearchError("Engine is not initialized; search connector cannot start")

    def search_claim(self, claim: str) -> SearchResult:
        """Search a claim using Tavily and return the best evidence.

        Retries once on failure and wraps all errors in ``SearchError``.
        """

        self._assert_engine_ready()

        if not self.api_key:
            raise SearchError("Tavily API key is missing.")

        if not claim or not claim.strip():
            raise SearchError("Claim text is empty.")

        try:
            return self._execute_search(claim)
        except Exception as exc:
            logger.warning("Primary search attempt failed: %s", exc)
            try:
                return self._execute_search(claim)
            except Exception as exc_final:
                raise SearchError(str(exc_final)) from exc_final

    def _execute_search(self, claim: str) -> SearchResult:
        payload: Dict[str, Any] = {
            "api_key": self.api_key,
            "query": claim.strip(),
            "max_results": 3,
            "search_depth": "advanced",
        }

        try:
            response = requests.post(self.SEARCH_URL, json=payload, timeout=self.timeout)
        except requests.Timeout as exc:
            logger.error("Search request timed out: %s", exc)
            raise SearchError("Search request timed out.") from exc
        except requests.RequestException as exc:  # pragma: no cover - generic safety
            logger.error("Search request failed: %s", exc)
            raise SearchError("Search request failed.") from exc

        if response.status_code == 429:
            logger.warning("Search rate limited (429)")
            raise SearchError("Rate limited by search provider.")

        if response.status_code >= 500:
            raise SearchError(f"Search provider error: {response.status_code}")

        if response.status_code != 200:
            raise SearchError(f"Search failed with status {response.status_code}")

        try:
            data = response.json()
        except ValueError as exc:
            raise SearchError("Invalid JSON response from search provider.") from exc

        results = data.get("results") or []
        if not results:
            raise SearchError("No results returned from search provider.")

        best = results[0]
        content = str(best.get("content") or best.get("snippet") or "").strip()
        url = str(best.get("url") or best.get("link") or "").strip()
        if not content or not url:
            raise SearchError("Search result missing content or url.")

        score = float(best.get("score") or best.get("relevance_score") or 0.5)
        return SearchResult(content=content[:1000], url=url, score=score)
