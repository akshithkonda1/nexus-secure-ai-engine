"""WIPO PatentScope connector."""

import logging
import os
import re
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class PatentScopeConnector(Tier3Connector):
    """
    WIPO PatentScope connector for international patents.

    Uses PatentScope search interface.
    For full API access, registration at WIPO is required.
    """

    SEARCH_URL = "https://patentscope.wipo.int/search/en/search.jsf"
    API_BASE = "https://patentscope.wipo.int/search/en/result.jsf"

    def __init__(self, access_token: Optional[str] = None):
        super().__init__(
            source_name="PatentScope-API",
            reliability=0.96,
            category=SourceCategory.PATENTS,
            enabled=True,
            requires_api_key=False  # Basic search works without auth
        )
        self.access_token = access_token or os.environ.get("WIPO_ACCESS_TOKEN")
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Engine (Patent Research)",
                "Accept": "text/html,application/xhtml+xml"
            }
            if self.access_token:
                headers["Authorization"] = f"Bearer {self.access_token}"
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=25),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()
            snippets = []

            # Use PatentScope search
            params = {
                "query": query,
                "sortBy": "relevance"
            }

            async with session.get(self.API_BASE, params=params) as response:
                if response.status != 200:
                    logger.warning(f"PatentScope: {response.status}")
                    self._record_error()
                    return []

                html = await response.text()

            # Parse search results from HTML
            # Look for patent entries - simplified pattern matching
            patent_pattern = r'WO[0-9]{4}/[0-9]+'
            title_pattern = r'<a[^>]*class="[^"]*trans-title[^"]*"[^>]*>([^<]+)</a>'

            # Find patent numbers
            patent_numbers = re.findall(patent_pattern, html)

            # Find titles near patent numbers
            titles = re.findall(title_pattern, html)

            # Pair them up
            for i, (patent_num, title) in enumerate(zip(patent_numbers[:max_results], titles[:max_results])):
                title = title.strip()
                if not title or len(title) < 5:
                    continue

                # Build URL
                url = f"https://patentscope.wipo.int/search/en/detail.jsf?docId={patent_num}"

                # Build content
                content_parts = [title]
                content_parts.append(f"Patent: {patent_num}")
                content_parts.append("Source: WIPO PatentScope")
                content_parts.append("\nInternational patent application from World Intellectual Property Organization.")

                content = "\n".join(content_parts)

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=content[:1500],
                    reliability=self.reliability,
                    category=self.category,
                    url=url,
                    metadata={
                        "patent_number": patent_num,
                        "title": title,
                        "type": "international_patent"
                    }
                )
                snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"PatentScope error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
