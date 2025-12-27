"""CrossRef connector for academic citations."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class CrossRefConnector(Tier3Connector):
    """
    CrossRef API connector for DOI and citation metadata.

    API docs: https://api.crossref.org/swagger-ui/index.html
    Free API, polite pool available with email in User-Agent.
    """

    API_BASE = "https://api.crossref.org/works"

    def __init__(self, email: Optional[str] = None):
        super().__init__(
            source_name="CrossRef-API",
            reliability=0.89,
            category=SourceCategory.ACADEMIC,
            enabled=True,
            requires_api_key=False  # Free API
        )
        self.email = email or os.environ.get("CROSSREF_EMAIL", "toron@research.ai")
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": f"TORON/2.5h+ (mailto:{self.email})"
            }
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            params = {
                "query": query,
                "rows": min(max_results, 100),
                "select": "DOI,title,abstract,author,published,container-title,is-referenced-by-count,URL"
            }

            async with session.get(self.API_BASE, params=params) as response:
                if response.status == 429:
                    logger.warning("CrossRef: Rate limited")
                    self._record_error()
                    return []

                if response.status != 200:
                    logger.warning(f"CrossRef: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            items = data.get("message", {}).get("items", [])

            for item in items[:max_results]:
                # Extract title (list of strings)
                titles = item.get("title", [])
                title = titles[0] if titles else "Untitled"

                # Extract abstract
                abstract = item.get("abstract", "") or ""
                # Remove XML/HTML tags from abstract
                import re
                abstract = re.sub(r'<[^>]+>', '', abstract)

                # Extract authors
                authors = item.get("author", [])
                author_names = []
                for author in authors[:3]:
                    given = author.get("given", "")
                    family = author.get("family", "")
                    if given and family:
                        author_names.append(f"{given} {family}")
                    elif family:
                        author_names.append(family)
                if len(authors) > 3:
                    author_names.append(f"et al. ({len(authors)} authors)")
                author_str = ", ".join(author_names)

                # Extract publication date
                published = item.get("published", {})
                date_parts = published.get("date-parts", [[]])[0]
                year = date_parts[0] if date_parts else ""

                # Journal/container
                container = item.get("container-title", [])
                journal = container[0] if container else ""

                # Citation count
                citation_count = item.get("is-referenced-by-count", 0)

                # DOI and URL
                doi = item.get("DOI", "")
                url = item.get("URL", f"https://doi.org/{doi}" if doi else "")

                # Build content
                content_parts = [title]
                if author_str:
                    content_parts.append(f"Authors: {author_str}")
                if journal:
                    content_parts.append(f"Journal: {journal}")
                if year:
                    content_parts.append(f"Year: {year}")
                if citation_count:
                    content_parts.append(f"Citations: {citation_count}")
                if doi:
                    content_parts.append(f"DOI: {doi}")
                if abstract:
                    content_parts.append(f"\n{abstract[:600]}")

                content = "\n".join(content_parts)

                if content.strip():
                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content[:1500],
                        reliability=self.reliability,
                        category=self.category,
                        url=url,
                        metadata={
                            "doi": doi,
                            "title": title,
                            "year": year,
                            "citation_count": citation_count,
                            "journal": journal,
                            "type": "academic_citation"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"CrossRef error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
