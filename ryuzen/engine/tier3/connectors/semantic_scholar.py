"""Semantic Scholar connector for academic research."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class SemanticScholarConnector(Tier3Connector):
    """
    Semantic Scholar API connector for AI-powered academic search.

    API docs: https://api.semanticscholar.org/api-docs/
    Free tier available, optional API key for higher rate limits.
    """

    API_BASE = "https://api.semanticscholar.org/graph/v1"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            source_name="SemanticScholar-API",
            reliability=0.91,
            category=SourceCategory.ACADEMIC,
            enabled=True,
            requires_api_key=False  # Free API available
        )
        self.api_key = api_key or os.environ.get("SEMANTIC_SCHOLAR_API_KEY")
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {}
            if self.api_key:
                headers["x-api-key"] = self.api_key
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            # Search for papers
            params = {
                "query": query,
                "limit": min(max_results, 100),
                "fields": "paperId,title,abstract,year,citationCount,authors,url,venue,publicationDate"
            }

            async with session.get(
                f"{self.API_BASE}/paper/search",
                params=params
            ) as response:
                if response.status == 429:
                    logger.warning("Semantic Scholar: Rate limited")
                    self._record_error()
                    return []

                if response.status != 200:
                    logger.warning(f"Semantic Scholar: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            papers = data.get("data", [])

            for paper in papers[:max_results]:
                title = paper.get("title", "")
                abstract = paper.get("abstract", "") or ""
                year = paper.get("year", "")
                citation_count = paper.get("citationCount", 0)
                venue = paper.get("venue", "")
                paper_id = paper.get("paperId", "")

                # Format authors
                authors = paper.get("authors", [])
                author_names = ", ".join([a.get("name", "") for a in authors[:3]])
                if len(authors) > 3:
                    author_names += f" et al. ({len(authors)} authors)"

                # Build content
                content_parts = [title]
                if author_names:
                    content_parts.append(f"Authors: {author_names}")
                if year:
                    content_parts.append(f"Year: {year}")
                if venue:
                    content_parts.append(f"Venue: {venue}")
                if citation_count:
                    content_parts.append(f"Citations: {citation_count}")
                if abstract:
                    content_parts.append(f"\n{abstract[:800]}")

                content = "\n".join(content_parts)

                if content.strip():
                    url = paper.get("url") or f"https://www.semanticscholar.org/paper/{paper_id}"
                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content[:1500],
                        reliability=self.reliability,
                        category=self.category,
                        url=url,
                        metadata={
                            "paper_id": paper_id,
                            "title": title,
                            "year": year,
                            "citation_count": citation_count,
                            "type": "academic_paper"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"Semantic Scholar error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
