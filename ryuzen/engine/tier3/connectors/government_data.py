"""Government Data connector."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class GovernmentDataConnector(Tier3Connector):
    """
    Government open data API connector.

    Uses Data.gov (US), data.gov.uk, and data.europa.eu CKAN APIs.
    API docs: https://catalog.data.gov/api/3
    """

    # Multiple government data sources
    DATA_SOURCES = {
        "us": {
            "base_url": "https://catalog.data.gov/api/3",
            "name": "US Data.gov"
        },
        "uk": {
            "base_url": "https://data.gov.uk/api/3",
            "name": "UK Data.gov.uk"
        },
        "eu": {
            "base_url": "https://data.europa.eu/api/hub/search",
            "name": "EU Open Data"
        }
    }

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            source_name="Government-Data-API",
            reliability=0.91,
            category=SourceCategory.GOVERNMENT,
            enabled=True,
            requires_api_key=False  # Most are free, optional key for higher limits
        )
        self.api_key = api_key or os.environ.get("DATA_GOV_API_KEY")
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Engine (Government Data Research)"
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

            # Search US Data.gov (CKAN API)
            us_source = self.DATA_SOURCES["us"]
            try:
                params = {
                    "q": query,
                    "rows": min(max_results, 100)
                }

                async with session.get(
                    f"{us_source['base_url']}/action/package_search",
                    params=params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        results = data.get("result", {}).get("results", [])

                        for dataset in results[:max_results]:
                            title = dataset.get("title", "")
                            notes = dataset.get("notes", "") or ""
                            org = dataset.get("organization", {})
                            org_name = org.get("title", "") if org else ""
                            dataset_id = dataset.get("id", "")
                            tags = dataset.get("tags", [])
                            tag_names = [t.get("display_name", "") for t in tags[:5]]
                            resources = dataset.get("resources", [])
                            resource_formats = list(set([r.get("format", "").upper() for r in resources[:5] if r.get("format")]))

                            # Build content
                            content_parts = [f"{us_source['name']}: {title}"]
                            if org_name:
                                content_parts.append(f"Organization: {org_name}")
                            if tag_names:
                                content_parts.append(f"Tags: {', '.join(tag_names)}")
                            if resource_formats:
                                content_parts.append(f"Formats: {', '.join(resource_formats)}")
                            if notes:
                                # Clean HTML from notes
                                import re
                                clean_notes = re.sub(r'<[^>]+>', '', notes)
                                content_parts.append(f"\n{clean_notes[:600]}")

                            content = "\n".join(content_parts)

                            url = f"https://catalog.data.gov/dataset/{dataset_id}"
                            snippet = KnowledgeSnippet(
                                source_name=self.source_name,
                                content=content[:1500],
                                reliability=self.reliability,
                                category=self.category,
                                url=url,
                                metadata={
                                    "dataset_id": dataset_id,
                                    "organization": org_name,
                                    "tags": tag_names,
                                    "formats": resource_formats,
                                    "source": "data.gov",
                                    "type": "government_dataset"
                                }
                            )
                            snippets.append(snippet)

            except Exception as e:
                logger.debug(f"US Data.gov search failed: {e}")

            # If we need more results, try UK Data.gov.uk
            if len(snippets) < max_results:
                uk_source = self.DATA_SOURCES["uk"]
                try:
                    params = {
                        "q": query,
                        "rows": min(max_results - len(snippets), 50)
                    }

                    async with session.get(
                        f"{uk_source['base_url']}/action/package_search",
                        params=params
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            results = data.get("result", {}).get("results", [])

                            for dataset in results[:max_results - len(snippets)]:
                                title = dataset.get("title", "")
                                notes = dataset.get("notes", "") or ""
                                dataset_name = dataset.get("name", "")

                                content_parts = [f"{uk_source['name']}: {title}"]
                                if notes:
                                    import re
                                    clean_notes = re.sub(r'<[^>]+>', '', notes)
                                    content_parts.append(f"\n{clean_notes[:500]}")

                                content = "\n".join(content_parts)

                                url = f"https://data.gov.uk/dataset/{dataset_name}"
                                snippet = KnowledgeSnippet(
                                    source_name=self.source_name,
                                    content=content[:1500],
                                    reliability=self.reliability,
                                    category=self.category,
                                    url=url,
                                    metadata={
                                        "dataset_name": dataset_name,
                                        "source": "data.gov.uk",
                                        "type": "government_dataset"
                                    }
                                )
                                snippets.append(snippet)

                except Exception as e:
                    logger.debug(f"UK Data.gov.uk search failed: {e}")

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"Government Data error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
