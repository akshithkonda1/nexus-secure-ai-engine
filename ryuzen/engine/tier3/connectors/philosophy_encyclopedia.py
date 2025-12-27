"""Internet Encyclopedia of Philosophy connector."""

import logging
import re
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class PhilosophyEncyclopediaConnector(Tier3Connector):
    """
    Internet Encyclopedia of Philosophy (IEP) connector.

    A peer-reviewed academic resource on philosophy.
    Website: https://iep.utm.edu/
    No API - uses search and page scraping.
    """

    BASE_URL = "https://iep.utm.edu"
    SEARCH_URL = "https://iep.utm.edu/"

    def __init__(self):
        super().__init__(
            source_name="Philosophy-Encyclopedia",
            reliability=0.89,
            category=SourceCategory.PHILOSOPHY,
            enabled=True,
            requires_api_key=False
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Engine (Philosophy Research)",
                "Accept": "text/html,application/xhtml+xml"
            }
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()
            snippets = []

            # IEP uses WordPress search
            params = {"s": query}

            async with session.get(self.SEARCH_URL, params=params) as response:
                if response.status != 200:
                    logger.warning(f"IEP search: {response.status}")
                    self._record_error()
                    return []

                html = await response.text()

            # Parse search results
            # Look for article entries in search results
            title_link_pattern = r'<h2[^>]*class="[^"]*entry-title[^"]*"[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)</a>'

            matches = re.findall(title_link_pattern, html, re.DOTALL)

            seen_urls = set()
            for href, title in matches[:max_results * 2]:
                title = title.strip()
                href = href.strip()

                if not title or not href or href in seen_urls:
                    continue
                if len(title) < 3:
                    continue

                seen_urls.add(href)

                # Fetch the article to get summary
                try:
                    async with session.get(href) as article_response:
                        if article_response.status == 200:
                            article_html = await article_response.text()

                            # Extract first paragraph as summary
                            # Look for content in entry-content div
                            content_match = re.search(
                                r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>(.*?)</div>',
                                article_html,
                                re.DOTALL
                            )

                            summary = ""
                            if content_match:
                                content_html = content_match.group(1)
                                # Get first substantial paragraph
                                p_matches = re.findall(r'<p[^>]*>(.*?)</p>', content_html, re.DOTALL)
                                for p in p_matches:
                                    clean_p = re.sub(r'<[^>]+>', '', p).strip()
                                    if len(clean_p) > 100:
                                        summary = clean_p
                                        break

                            # Extract table of contents if available
                            toc_match = re.search(r'Table of Contents.*?<ol[^>]*>(.*?)</ol>', article_html, re.DOTALL)
                            toc_items = []
                            if toc_match:
                                toc_items = re.findall(r'<li[^>]*>.*?<a[^>]*>([^<]+)</a>', toc_match.group(1))

                            # Build content
                            content_parts = [f"IEP: {title}"]
                            if toc_items:
                                content_parts.append(f"Sections: {', '.join(toc_items[:5])}")
                            if summary:
                                content_parts.append(f"\n{summary[:700]}")
                            else:
                                content_parts.append("\nPeer-reviewed philosophy encyclopedia article.")

                            content = "\n".join(content_parts)

                            snippet = KnowledgeSnippet(
                                source_name=self.source_name,
                                content=content[:1500],
                                reliability=self.reliability,
                                category=self.category,
                                url=href,
                                metadata={
                                    "title": title,
                                    "sections": toc_items[:10],
                                    "type": "philosophy_article"
                                }
                            )
                            snippets.append(snippet)

                except Exception as e:
                    logger.debug(f"Error fetching IEP article: {e}")
                    continue

                if len(snippets) >= max_results:
                    break

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"IEP error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
