"""Stanford Encyclopedia of Philosophy connector."""

import logging
import re
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class StanfordSEPConnector(Tier3Connector):
    """
    Stanford Encyclopedia of Philosophy (SEP) connector.

    The most authoritative online philosophy encyclopedia.
    Website: https://plato.stanford.edu/
    No official API - uses search and page scraping.
    """

    BASE_URL = "https://plato.stanford.edu"
    SEARCH_URL = "https://plato.stanford.edu/search/searcher.py"

    def __init__(self):
        super().__init__(
            source_name="Stanford-SEP",
            reliability=0.94,
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

            # SEP search parameters
            params = {
                "query": query,
                "nresults": min(max_results * 3, 20)
            }

            async with session.get(self.SEARCH_URL, params=params) as response:
                if response.status != 200:
                    logger.warning(f"SEP search: {response.status}")
                    self._record_error()
                    return []

                html = await response.text()

            # Parse search results
            # SEP returns results in a specific format
            result_pattern = r'<a[^>]*href="(/entries/[^"]+)"[^>]*>([^<]+)</a>'
            matches = re.findall(result_pattern, html)

            seen_urls = set()
            for path, title in matches[:max_results * 2]:
                title = title.strip()

                if not title or path in seen_urls:
                    continue

                seen_urls.add(path)
                url = f"{self.BASE_URL}{path}"

                # Fetch the entry to get summary
                try:
                    async with session.get(url) as entry_response:
                        if entry_response.status == 200:
                            entry_html = await entry_response.text()

                            # Get preamble/summary
                            preamble_match = re.search(
                                r'<div[^>]*id="preamble"[^>]*>(.*?)</div>',
                                entry_html,
                                re.DOTALL
                            )

                            summary = ""
                            if preamble_match:
                                preamble = preamble_match.group(1)
                                # Get text from paragraphs
                                p_matches = re.findall(r'<p[^>]*>(.*?)</p>', preamble, re.DOTALL)
                                for p in p_matches:
                                    clean_p = re.sub(r'<[^>]+>', '', p).strip()
                                    if len(clean_p) > 50:
                                        summary = clean_p
                                        break

                            # Get table of contents
                            toc_match = re.search(
                                r'<div[^>]*id="toc"[^>]*>(.*?)</div>',
                                entry_html,
                                re.DOTALL
                            )
                            toc_items = []
                            if toc_match:
                                toc_items = re.findall(r'<a[^>]*>([^<]+)</a>', toc_match.group(1))
                                toc_items = [t.strip() for t in toc_items if len(t.strip()) > 2]

                            # Get author and publication info
                            author_match = re.search(r'<meta name="author" content="([^"]+)"', entry_html)
                            author = author_match.group(1) if author_match else ""

                            date_match = re.search(r'First published ([^<;]+)', entry_html)
                            first_published = date_match.group(1).strip() if date_match else ""

                            revised_match = re.search(r'substantive revision ([^<;]+)', entry_html)
                            last_revised = revised_match.group(1).strip() if revised_match else ""

                            # Build content
                            content_parts = [f"SEP: {title}"]
                            if author:
                                content_parts.append(f"Author: {author}")
                            if first_published:
                                content_parts.append(f"First Published: {first_published}")
                            if last_revised:
                                content_parts.append(f"Last Revised: {last_revised}")
                            if toc_items:
                                content_parts.append(f"Sections: {', '.join(toc_items[:5])}")
                            if summary:
                                content_parts.append(f"\n{summary[:700]}")

                            content = "\n".join(content_parts)

                            snippet = KnowledgeSnippet(
                                source_name=self.source_name,
                                content=content[:1500],
                                reliability=self.reliability,
                                category=self.category,
                                url=url,
                                metadata={
                                    "title": title,
                                    "author": author,
                                    "first_published": first_published,
                                    "last_revised": last_revised,
                                    "sections": toc_items[:10],
                                    "type": "sep_article"
                                }
                            )
                            snippets.append(snippet)

                except Exception as e:
                    logger.debug(f"Error fetching SEP entry: {e}")
                    continue

                if len(snippets) >= max_results:
                    break

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"SEP error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
