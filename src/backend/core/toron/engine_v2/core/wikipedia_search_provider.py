"""Wikipedia/Wikimedia search provider using the MediaWiki API."""

from __future__ import annotations

import time
from typing import Dict, Optional
from urllib.parse import quote

import httpx

from .web_connectors_base import SEARCH_TIMEOUT, timeout_manager, toron_logger


class WikipediaSearchProvider:
    """Fetch introductory summaries from Wikipedia using MediaWiki API."""

    API_URL = "https://en.wikipedia.org/w/api.php"
    MAX_RETRIES = 4

    def __init__(self) -> None:
        self._client = httpx.Client()

    def search(self, claim: str) -> Dict[str, str]:
        if not claim or not claim.strip():
            toron_logger.warning("WikipediaSearchProvider received empty claim")
            return {}

        params = {
            "action": "query",
            "format": "json",
            "prop": "extracts",
            "explaintext": 1,
            "exintro": 1,
            "redirects": 1,
            "titles": claim.strip(),
        }

        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                toron_logger.info("WikipediaSearchProvider attempt %s for claim: %s", attempt, claim)
                response = timeout_manager.apply_timeout(
                    self._fetch, SEARCH_TIMEOUT, params
                )
                parsed = self._parse_response(response)
                if parsed:
                    return parsed
                toron_logger.warning("WikipediaSearchProvider returned empty content on attempt %s", attempt)
            except Exception as exc:  # noqa: BLE001
                toron_logger.error(
                    "WikipediaSearchProvider failure on attempt %s: %s", attempt, exc, exc_info=False
                )
            time.sleep(min(1.0 * attempt, 2.0))

        toron_logger.error("WikipediaSearchProvider exhausted retries for claim: %s", claim)
        return {}

    def _fetch(self, params: Dict[str, str]) -> httpx.Response:
        response = self._client.get(self.API_URL, params=params, timeout=SEARCH_TIMEOUT)
        response.raise_for_status()
        return response

    def _parse_response(self, response: httpx.Response) -> Dict[str, str]:
        try:
            data = response.json()
        except Exception as exc:  # noqa: BLE001
            toron_logger.error("WikipediaSearchProvider JSON decode error: %s", exc, exc_info=False)
            return {}

        query = data.get("query", {})
        pages = query.get("pages", {}) if isinstance(query, dict) else {}
        if not pages:
            toron_logger.warning("WikipediaSearchProvider received no pages in response")
            return {}

        page = self._resolve_page(pages)
        if not page:
            return {}

        extract = (page.get("extract") or "").strip()
        title = (page.get("title") or "").strip()
        if not extract or not title:
            toron_logger.warning("WikipediaSearchProvider missing extract or title for page")
            return {}

        canonical_title = self._canonicalize_title(query, title)
        source_url = f"https://en.wikipedia.org/wiki/{canonical_title}"

        return {"source": source_url, "content": extract}

    def _resolve_page(self, pages: Dict[str, Dict[str, str]]) -> Optional[Dict[str, str]]:
        for page in pages.values():
            if not isinstance(page, dict):
                continue
            page_id = page.get("pageid")
            if not page_id or page_id == -1:
                continue
            return page

        toron_logger.warning("WikipediaSearchProvider encountered missing or invalid page entries")
        return None

    def _canonicalize_title(self, query: Dict[str, object], title: str) -> str:
        redirects = query.get("redirects") if isinstance(query, dict) else None
        if isinstance(redirects, list) and redirects:
            final_target = redirects[-1].get("to") or redirects[-1].get("tofragment")
            if final_target:
                title = str(final_target)
        sanitized = title.replace(" ", "_").strip("_")
        return quote(sanitized)

    def __del__(self) -> None:  # pragma: no cover - defensive cleanup
        try:
            self._client.close()
        except Exception:
            pass
