"""Bing Web Search connector."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class BingSearchConnector(Tier3Connector):
    """
    Bing Web Search API connector.

    Requires:
    - BING_API_KEY: API key from Azure Cognitive Services

    API docs: https://docs.microsoft.com/en-us/bing/search-apis/bing-web-search/
    """

    API_BASE = "https://api.bing.microsoft.com/v7.0/search"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            source_name="Bing-Search",
            reliability=0.75,
            category=SourceCategory.GENERAL,
            enabled=True,
            requires_api_key=True
        )
        self.api_key = api_key or os.environ.get("BING_API_KEY")
        self._session = None

        if not self.api_key:
            logger.warning("Bing Search: Missing API key, connector will return empty results")

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "Ocp-Apim-Subscription-Key": self.api_key or "",
            }
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=10),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        if not self.api_key:
            logger.debug("Bing Search: No API key configured")
            return []

        try:
            session = await self._get_session()

            params = {
                "q": query,
                "count": min(max_results, 50),
                "mkt": "en-US",
                "safeSearch": "Moderate",
                "responseFilter": "Webpages",
            }

            async with session.get(self.API_BASE, params=params) as response:
                if response.status == 401:
                    logger.warning("Bing Search: Invalid API key")
                    self._record_error()
                    return []

                if response.status == 403:
                    logger.warning("Bing Search: API quota exceeded")
                    self._record_error()
                    return []

                if response.status != 200:
                    logger.warning(f"Bing Search: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            webpages = data.get("webPages", {}).get("value", [])

            for page in webpages[:max_results]:
                title = page.get("name", "")
                snippet_text = page.get("snippet", "")
                url = page.get("url", "")
                display_url = page.get("displayUrl", "")

                # Get deep links if available
                deep_links = page.get("deepLinks", [])

                content = f"{title}\n\n{snippet_text}"

                # Add deep links info
                if deep_links:
                    content += "\n\nRelated:"
                    for link in deep_links[:3]:
                        content += f"\n- {link.get('name', '')}"

                if content.strip():
                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content[:1500],
                        reliability=self.reliability,
                        category=self.category,
                        url=url,
                        metadata={
                            "title": title,
                            "display_url": display_url,
                            "date_last_crawled": page.get("dateLastCrawled", ""),
                            "type": "search_result"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"Bing Search error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
