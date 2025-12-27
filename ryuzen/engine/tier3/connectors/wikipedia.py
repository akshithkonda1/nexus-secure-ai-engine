"""Wikipedia connector for general knowledge."""

import logging
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class WikipediaConnector(Tier3Connector):
    """Wikipedia API connector for general knowledge."""

    API_BASE = "https://en.wikipedia.org/api/rest_v1"

    def __init__(self):
        super().__init__(
            source_name="Wikipedia-API",
            reliability=0.85,
            category=SourceCategory.GENERAL,
            enabled=True
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=10)
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            # First search for the topic
            search_url = f"{self.API_BASE}/page/related/{query.replace(' ', '_')}"

            # Try to get summary directly first
            search_term = query.replace(" ", "_")
            url = f"{self.API_BASE}/page/summary/{search_term}"

            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("extract", "")
                    if content:
                        snippet = KnowledgeSnippet(
                            source_name=self.source_name,
                            content=content,
                            reliability=self.reliability,
                            category=self.category,
                            url=data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                            metadata={"title": data.get("title", ""), "type": data.get("type", "")}
                        )
                        self._record_success()
                        return [snippet]

            # Fallback: search API
            search_api = "https://en.wikipedia.org/w/api.php"
            params = {
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json",
                "srlimit": max_results
            }

            async with session.get(search_api, params=params) as response:
                if response.status != 200:
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            search_results = data.get("query", {}).get("search", [])

            for result in search_results[:max_results]:
                title = result.get("title", "")
                # Get summary for each result
                summary_url = f"{self.API_BASE}/page/summary/{title.replace(' ', '_')}"
                try:
                    async with session.get(summary_url) as resp:
                        if resp.status == 200:
                            summary_data = await resp.json()
                            content = summary_data.get("extract", "")
                            if content:
                                snippet = KnowledgeSnippet(
                                    source_name=self.source_name,
                                    content=content[:1500],
                                    reliability=self.reliability,
                                    category=self.category,
                                    url=summary_data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                                    metadata={"title": title}
                                )
                                snippets.append(snippet)
                except Exception:
                    continue

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"Wikipedia error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
