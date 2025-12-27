"""Financial Times connector."""

import logging
import os
import re
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class FinancialTimesConnector(Tier3Connector):
    """
    Financial Times connector for business news.

    Note: FT's official API requires enterprise subscription.
    This connector uses the public search for basic functionality.
    For full access, set FT_API_KEY environment variable.
    """

    SEARCH_URL = "https://www.ft.com/search"
    API_BASE = "https://api.ft.com/content/search/v1"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            source_name="FinancialTimes-API",
            reliability=0.87,
            category=SourceCategory.FINANCIAL,
            enabled=True,
            requires_api_key=False  # Basic search works without key
        )
        self.api_key = api_key or os.environ.get("FT_API_KEY")
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Engine (Financial Research)",
                "Accept": "text/html,application/json"
            }
            if self.api_key:
                headers["X-Api-Key"] = self.api_key
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()
            snippets = []

            # Use public search (API requires enterprise subscription)
            params = {"q": query}

            async with session.get(self.SEARCH_URL, params=params) as response:
                if response.status != 200:
                    logger.warning(f"FT search: {response.status}")
                    self._record_error()
                    return []

                html = await response.text()

            # Parse search results from HTML
            # FT uses specific class names for search results
            article_pattern = r'<a[^>]*href="(/content/[^"]+)"[^>]*class="[^"]*js-teaser-heading-link[^"]*"[^>]*>([^<]+)</a>'
            standfirst_pattern = r'<p[^>]*class="[^"]*o-teaser__standfirst[^"]*"[^>]*>([^<]+)</p>'
            date_pattern = r'<time[^>]*datetime="([^"]+)"[^>]*>'

            # Alternative simpler pattern
            article_matches = re.findall(
                r'<a[^>]*href="(https://www\.ft\.com/content/[^"]+)"[^>]*>([^<]+)</a>',
                html
            )

            # Also try content paths
            if not article_matches:
                article_matches = re.findall(
                    r'<a[^>]*href="(/content/[^"]+)"[^>]*>([^<]+)</a>',
                    html
                )
                article_matches = [(f"https://www.ft.com{path}", title) for path, title in article_matches]

            seen_urls = set()
            for url, title in article_matches[:max_results * 3]:
                title = title.strip()

                if not title or url in seen_urls or len(title) < 10:
                    continue

                # Skip navigation and non-article links
                if any(x in title.lower() for x in ['sign in', 'subscribe', 'menu', 'search']):
                    continue

                seen_urls.add(url)

                # Determine content type from URL
                content_type = "Article"
                if "/video/" in url:
                    content_type = "Video"
                elif "/podcast/" in url:
                    content_type = "Podcast"
                elif "/opinion/" in url:
                    content_type = "Opinion"
                elif "/markets/" in url:
                    content_type = "Markets"

                # Build content
                content_parts = [title]
                content_parts.append(f"Source: Financial Times")
                content_parts.append(f"Type: {content_type}")
                content_parts.append("\nBusiness and financial news from the Financial Times.")

                content = "\n".join(content_parts)

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=content[:1500],
                    reliability=self.reliability,
                    category=self.category,
                    url=url,
                    metadata={
                        "title": title,
                        "content_type": content_type,
                        "type": "ft_article"
                    }
                )
                snippets.append(snippet)

                if len(snippets) >= max_results:
                    break

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"Financial Times error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
