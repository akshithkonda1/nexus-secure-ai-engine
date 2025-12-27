"""EU Legislation connector."""

import logging
import re
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class EULegislationConnector(Tier3Connector):
    """
    EUR-Lex API connector for EU legislation and legal documents.

    Uses EUR-Lex SPARQL and search APIs.
    API docs: https://eur-lex.europa.eu/content/tools/webservices/SearchWebServiceUserManual_v2.00.pdf
    """

    SEARCH_URL = "https://eur-lex.europa.eu/search.html"
    API_BASE = "https://eur-lex.europa.eu/eurlex-ws/search"

    def __init__(self):
        super().__init__(
            source_name="EU-Legislation-API",
            reliability=0.93,
            category=SourceCategory.LEGAL,
            enabled=True,
            requires_api_key=False  # Free API
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Engine (Legal Research)",
                "Accept": "application/xml, text/html"
            }
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=20),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()
            snippets = []

            # Use EUR-Lex search with scraping fallback
            # The official web service requires registration, so we use the public search
            params = {
                "text": query,
                "scope": "EURLEX",
                "type": "quick",
                "lang": "en",
                "page": "1"
            }

            async with session.get(self.SEARCH_URL, params=params) as response:
                if response.status != 200:
                    logger.warning(f"EUR-Lex search: {response.status}")
                    self._record_error()
                    return []

                html = await response.text()

            # Parse search results from HTML
            # Look for result items
            result_pattern = r'<div class="SearchResult"[^>]*>(.*?)</div>\s*</div>'
            title_pattern = r'<a[^>]*class="[^"]*title[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)</a>'
            celex_pattern = r'CELEX[:\s]*([0-9A-Z]+)'
            summary_pattern = r'<p class="[^"]*summary[^"]*"[^>]*>(.*?)</p>'

            # Alternative simpler pattern for titles and links
            links = re.findall(
                r'<a[^>]*href="(/legal-content/[^"]+)"[^>]*>([^<]+)</a>',
                html
            )

            seen_titles = set()
            for href, title in links[:max_results * 3]:
                title = title.strip()

                # Skip duplicates and navigation links
                if not title or title in seen_titles or len(title) < 10:
                    continue
                if title.lower() in ['search', 'home', 'help', 'en', 'english']:
                    continue

                seen_titles.add(title)

                # Extract CELEX number if present
                celex_match = re.search(r'/([0-9]{5}[A-Z][0-9]+)', href)
                celex = celex_match.group(1) if celex_match else ""

                # Determine document type from title/href
                doc_type = "Legislation"
                if "regulation" in title.lower() or "/R/" in href:
                    doc_type = "Regulation"
                elif "directive" in title.lower() or "/L/" in href:
                    doc_type = "Directive"
                elif "decision" in title.lower() or "/D/" in href:
                    doc_type = "Decision"
                elif "recommendation" in title.lower():
                    doc_type = "Recommendation"
                elif "opinion" in title.lower():
                    doc_type = "Opinion"

                # Build URL
                url = f"https://eur-lex.europa.eu{href}" if href.startswith("/") else href

                # Build content
                content_parts = [title]
                content_parts.append(f"Type: {doc_type}")
                if celex:
                    content_parts.append(f"CELEX: {celex}")
                content_parts.append(f"\nEuropean Union legal document from EUR-Lex.")

                content = "\n".join(content_parts)

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=content[:1500],
                    reliability=self.reliability,
                    category=self.category,
                    url=url,
                    metadata={
                        "celex": celex,
                        "doc_type": doc_type,
                        "type": "eu_legislation"
                    }
                )
                snippets.append(snippet)

                if len(snippets) >= max_results:
                    break

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"EU Legislation error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
