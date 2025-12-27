"""NASA connector for space and science data."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class NASAConnector(Tier3Connector):
    """
    NASA API connector for space and science data.

    Uses NASA Image and Video Library API + NASA Open APIs.
    API docs: https://api.nasa.gov/
    Free API key required (get from https://api.nasa.gov/)
    """

    # NASA APIs
    IMAGES_API = "https://images-api.nasa.gov/search"
    TECHPORT_API = "https://api.nasa.gov/techport/api/projects"
    LIBRARY_API = "https://ntrs.nasa.gov/api/citations/search"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            source_name="NASA-API",
            reliability=0.98,
            category=SourceCategory.SCIENCE,
            enabled=True,
            requires_api_key=True  # Free API key required
        )
        # NASA provides a demo key for testing
        self.api_key = api_key or os.environ.get("NASA_API_KEY", "DEMO_KEY")
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Engine (Science Research)"
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

            # Search NASA Image and Video Library
            params = {
                "q": query,
                "media_type": "image,video",
                "page_size": min(max_results * 2, 100)
            }

            async with session.get(self.IMAGES_API, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    collection = data.get("collection", {})
                    items = collection.get("items", [])

                    for item in items[:max_results]:
                        item_data = item.get("data", [{}])[0]
                        title = item_data.get("title", "")
                        description = item_data.get("description", "") or ""
                        date_created = item_data.get("date_created", "")
                        center = item_data.get("center", "")
                        media_type = item_data.get("media_type", "")
                        keywords = item_data.get("keywords", [])
                        nasa_id = item_data.get("nasa_id", "")

                        # Get thumbnail
                        links = item.get("links", [])
                        thumbnail = ""
                        for link in links:
                            if link.get("rel") == "preview":
                                thumbnail = link.get("href", "")
                                break

                        # Build content
                        content_parts = [title]
                        if center:
                            content_parts.append(f"NASA Center: {center}")
                        if date_created:
                            content_parts.append(f"Date: {date_created[:10]}")
                        if media_type:
                            content_parts.append(f"Media: {media_type}")
                        if keywords:
                            content_parts.append(f"Keywords: {', '.join(keywords[:5])}")
                        if description:
                            # Clean up description
                            clean_desc = description.replace("\n", " ").strip()
                            content_parts.append(f"\n{clean_desc[:600]}")

                        content = "\n".join(content_parts)

                        url = f"https://images.nasa.gov/details/{nasa_id}" if nasa_id else ""

                        snippet = KnowledgeSnippet(
                            source_name=self.source_name,
                            content=content[:1500],
                            reliability=self.reliability,
                            category=self.category,
                            url=url,
                            metadata={
                                "nasa_id": nasa_id,
                                "title": title,
                                "center": center,
                                "media_type": media_type,
                                "keywords": keywords[:10],
                                "has_thumbnail": bool(thumbnail),
                                "type": "nasa_media"
                            }
                        )
                        snippets.append(snippet)

            # Also search NASA Technical Reports Server
            if len(snippets) < max_results:
                try:
                    ntrs_params = {
                        "keyword": query,
                        "size": min(max_results - len(snippets), 20)
                    }

                    async with session.get(self.LIBRARY_API, params=ntrs_params) as response:
                        if response.status == 200:
                            data = await response.json()
                            results = data.get("results", [])

                            for result in results[:max_results - len(snippets)]:
                                title = result.get("title", "")
                                abstract = result.get("abstract", "") or ""
                                publication_date = result.get("publicationDate", "")
                                center = result.get("center", {}).get("name", "")
                                doc_id = result.get("id", "")

                                authors = result.get("authorAffiliations", [])
                                author_names = []
                                for author in authors[:3]:
                                    meta = author.get("meta", {})
                                    name = meta.get("author", {}).get("name", "")
                                    if name:
                                        author_names.append(name)
                                author_str = ", ".join(author_names)

                                content_parts = [f"NASA Report: {title}"]
                                if author_str:
                                    content_parts.append(f"Authors: {author_str}")
                                if center:
                                    content_parts.append(f"Center: {center}")
                                if publication_date:
                                    content_parts.append(f"Date: {publication_date}")
                                if abstract:
                                    content_parts.append(f"\n{abstract[:500]}")

                                content = "\n".join(content_parts)

                                url = f"https://ntrs.nasa.gov/citations/{doc_id}" if doc_id else ""

                                snippet = KnowledgeSnippet(
                                    source_name=self.source_name,
                                    content=content[:1500],
                                    reliability=self.reliability,
                                    category=self.category,
                                    url=url,
                                    metadata={
                                        "doc_id": doc_id,
                                        "title": title,
                                        "center": center,
                                        "type": "nasa_report"
                                    }
                                )
                                snippets.append(snippet)

                except Exception as e:
                    logger.debug(f"NASA NTRS search failed: {e}")

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"NASA error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
