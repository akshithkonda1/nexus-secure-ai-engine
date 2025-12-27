"""CORE connector for open access research."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class COREConnector(Tier3Connector):
    """
    CORE API connector for open access research aggregation.

    API docs: https://core.ac.uk/documentation/api
    Requires API key from https://core.ac.uk/services/api
    """

    API_BASE = "https://api.core.ac.uk/v3"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            source_name="CORE-API",
            reliability=0.86,
            category=SourceCategory.ACADEMIC,
            enabled=True,
            requires_api_key=True
        )
        self.api_key = api_key or os.environ.get("CORE_API_KEY")
        self._session = None

        if not self.api_key:
            logger.warning("CORE: Missing API key, connector will return empty results")

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=20),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        if not self.api_key:
            logger.debug("CORE: No API key configured")
            return []

        try:
            session = await self._get_session()

            # Search for works
            params = {
                "q": query,
                "limit": min(max_results, 100),
            }

            async with session.get(
                f"{self.API_BASE}/search/works",
                params=params
            ) as response:
                if response.status == 401:
                    logger.warning("CORE: Invalid API key")
                    self._record_error()
                    return []

                if response.status == 429:
                    logger.warning("CORE: Rate limited")
                    self._record_error()
                    return []

                if response.status != 200:
                    logger.warning(f"CORE: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            results = data.get("results", [])

            for work in results[:max_results]:
                title = work.get("title", "") or ""
                abstract = work.get("abstract", "") or ""
                doi = work.get("doi", "")
                year = work.get("yearPublished", "")
                download_url = work.get("downloadUrl", "")

                # Authors
                authors = work.get("authors", [])
                author_names = []
                for author in authors[:3]:
                    name = author.get("name", "")
                    if name:
                        author_names.append(name)
                if len(authors) > 3:
                    author_names.append(f"et al. ({len(authors)} authors)")
                author_str = ", ".join(author_names)

                # Publisher/Journal
                publisher = work.get("publisher", "")
                journals = work.get("journals", [])
                journal = journals[0].get("title", "") if journals else ""

                # Language
                language = work.get("language", {})
                lang_code = language.get("code", "") if isinstance(language, dict) else ""

                # Document type
                doc_type = work.get("documentType", "")

                # Full text available
                has_fulltext = work.get("fullText") is not None

                # Build content
                content_parts = [title]
                if author_str:
                    content_parts.append(f"Authors: {author_str}")
                if journal:
                    content_parts.append(f"Journal: {journal}")
                elif publisher:
                    content_parts.append(f"Publisher: {publisher}")
                if year:
                    content_parts.append(f"Year: {year}")
                if doc_type:
                    content_parts.append(f"Type: {doc_type}")
                if has_fulltext:
                    content_parts.append("Full Text: Available")
                if abstract:
                    content_parts.append(f"\n{abstract[:700]}")

                content = "\n".join(content_parts)

                if content.strip():
                    # Prefer DOI URL, then download URL, then CORE link
                    core_id = work.get("id", "")
                    url = ""
                    if doi:
                        url = f"https://doi.org/{doi}" if not doi.startswith("http") else doi
                    elif download_url:
                        url = download_url
                    elif core_id:
                        url = f"https://core.ac.uk/works/{core_id}"

                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content[:1500],
                        reliability=self.reliability,
                        category=self.category,
                        url=url,
                        metadata={
                            "core_id": core_id,
                            "doi": doi,
                            "title": title,
                            "year": year,
                            "has_fulltext": has_fulltext,
                            "language": lang_code,
                            "type": "open_access_work"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"CORE error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
