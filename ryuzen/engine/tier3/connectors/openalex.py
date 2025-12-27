"""OpenAlex connector for academic research graph."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class OpenAlexConnector(Tier3Connector):
    """
    OpenAlex API connector for academic research metadata.

    API docs: https://docs.openalex.org/
    Free API, email for polite pool recommended.
    """

    API_BASE = "https://api.openalex.org"

    def __init__(self, email: Optional[str] = None):
        super().__init__(
            source_name="OpenAlex-API",
            reliability=0.88,
            category=SourceCategory.ACADEMIC,
            enabled=True,
            requires_api_key=False  # Free API
        )
        self.email = email or os.environ.get("OPENALEX_EMAIL", "toron@research.ai")
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15)
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            # Search for works
            params = {
                "search": query,
                "per_page": min(max_results, 200),
                "mailto": self.email
            }

            async with session.get(
                f"{self.API_BASE}/works",
                params=params
            ) as response:
                if response.status == 429:
                    logger.warning("OpenAlex: Rate limited")
                    self._record_error()
                    return []

                if response.status != 200:
                    logger.warning(f"OpenAlex: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            results = data.get("results", [])

            for work in results[:max_results]:
                title = work.get("title", "") or ""
                doi = work.get("doi", "")
                publication_year = work.get("publication_year", "")
                cited_by_count = work.get("cited_by_count", 0)
                work_type = work.get("type", "")

                # Abstract (from abstract_inverted_index)
                abstract_index = work.get("abstract_inverted_index", {})
                abstract = self._reconstruct_abstract(abstract_index)

                # Authors
                authorships = work.get("authorships", [])
                author_names = []
                for authorship in authorships[:3]:
                    author = authorship.get("author", {})
                    name = author.get("display_name", "")
                    if name:
                        author_names.append(name)
                if len(authorships) > 3:
                    author_names.append(f"et al. ({len(authorships)} authors)")
                author_str = ", ".join(author_names)

                # Source/Journal
                primary_location = work.get("primary_location", {}) or {}
                source = primary_location.get("source", {}) or {}
                journal = source.get("display_name", "")

                # Concepts/Topics
                concepts = work.get("concepts", [])
                concept_names = [c.get("display_name", "") for c in concepts[:5] if c.get("score", 0) > 0.3]
                concepts_str = ", ".join(concept_names)

                # Open access
                open_access = work.get("open_access", {})
                is_oa = open_access.get("is_oa", False)
                oa_url = open_access.get("oa_url", "")

                # Build content
                content_parts = [title]
                if author_str:
                    content_parts.append(f"Authors: {author_str}")
                if journal:
                    content_parts.append(f"Journal: {journal}")
                if publication_year:
                    content_parts.append(f"Year: {publication_year}")
                if cited_by_count:
                    content_parts.append(f"Citations: {cited_by_count}")
                if work_type:
                    content_parts.append(f"Type: {work_type}")
                if concepts_str:
                    content_parts.append(f"Topics: {concepts_str}")
                if is_oa:
                    content_parts.append("Open Access: Yes")
                if abstract:
                    content_parts.append(f"\n{abstract[:600]}")

                content = "\n".join(content_parts)

                if content.strip():
                    # Use DOI URL, OA URL, or OpenAlex URL
                    url = doi or oa_url or work.get("id", "")
                    if doi and not doi.startswith("http"):
                        url = f"https://doi.org/{doi.replace('https://doi.org/', '')}"

                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content[:1500],
                        reliability=self.reliability,
                        category=self.category,
                        url=url,
                        metadata={
                            "openalex_id": work.get("id", ""),
                            "doi": doi,
                            "title": title,
                            "year": publication_year,
                            "citation_count": cited_by_count,
                            "is_open_access": is_oa,
                            "type": "academic_work"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"OpenAlex error: {e}")
            self._record_error()
            return []

    def _reconstruct_abstract(self, inverted_index: dict) -> str:
        """Reconstruct abstract from OpenAlex inverted index format."""
        if not inverted_index:
            return ""

        try:
            # Create word position pairs
            word_positions = []
            for word, positions in inverted_index.items():
                for pos in positions:
                    word_positions.append((pos, word))

            # Sort by position and join
            word_positions.sort(key=lambda x: x[0])
            return " ".join([word for _, word in word_positions])
        except Exception:
            return ""

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
