"""Britannica connector - Expert encyclopedia via web scraping."""

import logging
import os
import re
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class BritannicaConnector(Tier3Connector):
    """
    Britannica connector for expert encyclopedia content.

    Uses Britannica's public search and article pages.
    For production, consider using their official API.
    """

    SEARCH_URL = "https://www.britannica.com/search"
    BASE_URL = "https://www.britannica.com"

    def __init__(self):
        super().__init__(
            source_name="Britannica-API",
            reliability=1.0,
            category=SourceCategory.GENERAL,
            enabled=True,
            requires_api_key=False
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Search Engine (Educational Research)",
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
            }
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            # Search Britannica
            params = {"query": query}
            async with session.get(self.SEARCH_URL, params=params) as response:
                if response.status != 200:
                    logger.warning(f"Britannica search: {response.status}")
                    self._record_error()
                    return []

                html = await response.text()

            # Parse search results (extract article links and snippets)
            snippets = []

            # Find article links and descriptions using regex
            # Pattern for search result items
            article_pattern = r'<a[^>]*href="(/[^"]+)"[^>]*class="[^"]*md-crosslink[^"]*"[^>]*>([^<]+)</a>'
            desc_pattern = r'<p[^>]*class="[^"]*searchresult[^"]*"[^>]*>([^<]+)</p>'

            # Alternative: look for structured data
            title_matches = re.findall(r'<h2[^>]*>\s*<a[^>]*href="(/[^"]+)"[^>]*>([^<]+)</a>', html)

            for path, title in title_matches[:max_results]:
                if not path.startswith('/topic/') and not path.startswith('/biography/') and not path.startswith('/place/'):
                    continue

                # Fetch article summary
                article_url = f"{self.BASE_URL}{path}"
                try:
                    async with session.get(article_url) as article_response:
                        if article_response.status == 200:
                            article_html = await article_response.text()

                            # Extract first paragraph/summary
                            summary_match = re.search(
                                r'<p[^>]*class="[^"]*topic-paragraph[^"]*"[^>]*>(.*?)</p>',
                                article_html,
                                re.DOTALL
                            )

                            if summary_match:
                                # Clean HTML tags
                                content = re.sub(r'<[^>]+>', '', summary_match.group(1))
                                content = content.strip()

                                if len(content) > 50:
                                    snippet = KnowledgeSnippet(
                                        source_name=self.source_name,
                                        content=f"{title.strip()}\n\n{content[:1500]}",
                                        reliability=self.reliability,
                                        category=self.category,
                                        url=article_url,
                                        metadata={"title": title.strip(), "type": "encyclopedia"}
                                    )
                                    snippets.append(snippet)
                except Exception as e:
                    logger.debug(f"Error fetching article {path}: {e}")
                    continue

            if not snippets:
                # Fallback: try direct topic lookup
                topic_url = f"{self.BASE_URL}/topic/{query.replace(' ', '-').lower()}"
                try:
                    async with session.get(topic_url) as response:
                        if response.status == 200:
                            html = await response.text()
                            summary_match = re.search(
                                r'<p[^>]*class="[^"]*topic-paragraph[^"]*"[^>]*>(.*?)</p>',
                                html,
                                re.DOTALL
                            )
                            if summary_match:
                                content = re.sub(r'<[^>]+>', '', summary_match.group(1)).strip()
                                if len(content) > 50:
                                    snippets.append(KnowledgeSnippet(
                                        source_name=self.source_name,
                                        content=content[:1500],
                                        reliability=self.reliability,
                                        category=self.category,
                                        url=topic_url,
                                        metadata={"type": "encyclopedia"}
                                    ))
                except Exception:
                    pass

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"Britannica error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
