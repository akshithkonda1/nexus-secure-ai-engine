"""Search connector implementing ordered provider fallbacks."""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional

import requests
from bs4 import BeautifulSoup

from .mock_search import MockSearchConnector
from .timeout_manager import SEARCH_TIMEOUT
from .toron_logger import get_logger, log_event

logger = get_logger("nexus.search")


class SearchError(Exception):
    """Raised when a provider encounters an unrecoverable error."""


@dataclass
class SearchResult:
    source: str
    content: str


class SearchConnector:
    """Query multiple search providers with deterministic fallbacks."""

    def __init__(
        self,
        google_api_key: Optional[str] = None,
        google_cx: Optional[str] = None,
        tavily_api_key: Optional[str] = None,
        sim_mode: bool | None = None,
    ) -> None:
        self.google_api_key = google_api_key or os.getenv("GOOGLE_CSE_KEY")
        self.google_cx = google_cx or os.getenv("GOOGLE_CSE_ID")
        self.tavily_api_key = tavily_api_key or os.getenv("TAVILY_API_KEY")
        self.session = requests.Session()
        self.sim_mode = sim_mode if sim_mode is not None else os.getenv("SIM_MODE", "").lower() == "true"
        self.mock = MockSearchConnector() if self.sim_mode else None
        self.providers: List[Callable[[str, int], List[SearchResult]]] = [
            self._google,
            self._duckduckgo,
            self._tavily,
            self._wikipedia,
        ]

    def search(self, query: str, max_results: int = 3) -> List[Dict[str, str]]:
        """Search using providers in priority order with retries."""

        if self.sim_mode and self.mock:
            log_event(logger, "search.mock", query=query)
            return [r.__dict__ for r in self.mock.search(query, max_results)]

        log_event(logger, "search.start", query=query)
        for provider in self.providers:
            results = self._run_with_retry(provider, query, max_results)
            if results:
                log_event(logger, "search.success", provider=provider.__name__, results=len(results))
                return [r.__dict__ for r in results]
        fallback = self._fallback()
        log_event(logger, "search.fallback", query=query)
        return [fallback.__dict__]

    def _run_with_retry(
        self, provider: Callable[[str, int], List[SearchResult]], query: str, max_results: int
    ) -> List[SearchResult]:
        attempts = 4
        for attempt in range(1, attempts + 1):
            try:
                log_event(logger, "search.attempt", provider=provider.__name__, attempt=attempt)
                results = provider(query, max_results)
                if results:
                    return results
            except Exception as exc:
                log_event(logger, "search.error", provider=provider.__name__, attempt=attempt, error=str(exc))
            time.sleep(0.1 * attempt)
        return []

    def _google(self, query: str, max_results: int) -> List[SearchResult]:
        if not self.google_api_key or not self.google_cx:
            return []
        url = "https://www.googleapis.com/customsearch/v1"
        params = {"q": query, "key": self.google_api_key, "cx": self.google_cx, "num": max_results}
        resp = self.session.get(url, params=params, timeout=SEARCH_TIMEOUT)
        data = resp.json()
        items = data.get("items", []) if isinstance(data, dict) else []
        results: List[SearchResult] = []
        for item in items:
            link = item.get("link")
            snippet = item.get("snippet") or ""
            if link and snippet:
                results.append(SearchResult(source=str(link), content=str(snippet)))
        return results

    def _duckduckgo(self, query: str, max_results: int) -> List[SearchResult]:
        url = "https://duckduckgo.com/html/"
        resp = self.session.get(url, params={"q": query}, timeout=SEARCH_TIMEOUT)
        soup = BeautifulSoup(resp.text, "html.parser")
        results: List[SearchResult] = []
        for a_tag in soup.select("a.result__a")[:max_results]:
            title = a_tag.get_text(strip=True)
            href = a_tag.get("href", "")
            snippet_tag = a_tag.find_parent("div", class_="result__body")
            snippet_text = ""
            if snippet_tag:
                snippet_text = snippet_tag.get_text(" ", strip=True)
            content = f"{title} - {snippet_text}".strip()
            if href and content:
                results.append(SearchResult(source=href, content=content))
        return results

    def _tavily(self, query: str, max_results: int) -> List[SearchResult]:
        if not self.tavily_api_key:
            return []
        url = "https://api.tavily.com/search"
        payload = {"api_key": self.tavily_api_key, "query": query, "max_results": max_results}
        resp = self.session.post(url, json=payload, timeout=SEARCH_TIMEOUT)
        data = resp.json()
        results: List[SearchResult] = []
        top_results = data.get("results") if isinstance(data, dict) else None
        if isinstance(top_results, list):
            for item in top_results[:max_results]:
                url_val = item.get("url") or item.get("source")
                content_val = item.get("content") or item.get("snippet")
                if url_val and content_val:
                    results.append(SearchResult(source=str(url_val), content=str(content_val)))
        return results

    def _wikipedia(self, query: str, max_results: int) -> List[SearchResult]:
        url = "https://en.wikipedia.org/w/api.php"
        params = {"action": "query", "list": "search", "srsearch": query, "format": "json", "srlimit": max_results}
        resp = self.session.get(url, params=params, timeout=SEARCH_TIMEOUT)
        data = resp.json()
        search_results = data.get("query", {}).get("search", []) if isinstance(data, dict) else []
        results: List[SearchResult] = []
        for item in search_results:
            title = item.get("title")
            if not title:
                continue
            summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title.replace(' ', '%20')}"
            summary_resp = self.session.get(summary_url, timeout=SEARCH_TIMEOUT)
            try:
                summary_data = summary_resp.json()
            except json.JSONDecodeError:
                continue
            extract = summary_data.get("extract") or summary_data.get("description")
            canonical = summary_data.get("content_urls", {}).get("desktop", {}).get("page")
            if canonical and extract:
                results.append(SearchResult(source=str(canonical), content=str(extract)))
        return results

    @staticmethod
    def _fallback() -> SearchResult:
        return SearchResult(
            source="toron:fallback", content="Search was not created. No verified evidence found."
        )


__all__ = ["SearchConnector", "SearchError", "SearchResult"]
