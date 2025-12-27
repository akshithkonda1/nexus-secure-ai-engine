"""Google Custom Search connector."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class GoogleSearchConnector(Tier3Connector):
    """
    Google Custom Search API connector.

    Requires:
    - GOOGLE_API_KEY: API key from Google Cloud Console
    - GOOGLE_CSE_ID: Custom Search Engine ID

    API docs: https://developers.google.com/custom-search/v1/overview
    """

    API_BASE = "https://www.googleapis.com/customsearch/v1"

    def __init__(self, api_key: Optional[str] = None, cse_id: Optional[str] = None):
        super().__init__(
            source_name="Google-Search",
            reliability=0.75,
            category=SourceCategory.GENERAL,
            enabled=True,
            requires_api_key=True
        )
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        self.cse_id = cse_id or os.environ.get("GOOGLE_CSE_ID")
        self._session = None

        if not self.api_key or not self.cse_id:
            logger.warning("Google Search: Missing API key or CSE ID, connector will return empty results")

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=10)
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        if not self.api_key or not self.cse_id:
            logger.debug("Google Search: No API credentials configured")
            return []

        try:
            session = await self._get_session()

            params = {
                "key": self.api_key,
                "cx": self.cse_id,
                "q": query,
                "num": min(max_results, 10),  # Max 10 per request
                "safe": "active",
            }

            async with session.get(self.API_BASE, params=params) as response:
                if response.status == 403:
                    logger.warning("Google Search: API quota exceeded or invalid key")
                    self._record_error()
                    return []

                if response.status != 200:
                    logger.warning(f"Google Search: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            items = data.get("items", [])

            for item in items[:max_results]:
                title = item.get("title", "")
                snippet_text = item.get("snippet", "")
                link = item.get("link", "")

                # Get additional info from pagemap if available
                pagemap = item.get("pagemap", {})
                metatags = pagemap.get("metatags", [{}])[0]
                description = metatags.get("og:description", snippet_text)

                content = f"{title}\n\n{description}"

                if content.strip():
                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content[:1500],
                        reliability=self.reliability,
                        category=self.category,
                        url=link,
                        metadata={
                            "title": title,
                            "display_link": item.get("displayLink", ""),
                            "type": "search_result"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"Google Search error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
