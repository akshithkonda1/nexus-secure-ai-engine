"""USPTO connector for US patents."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class USPTOConnector(Tier3Connector):
    """
    USPTO PatentsView API connector for US patent records.

    API docs: https://patentsview.org/apis/api-endpoints
    Free API, optional API key for higher rate limits.
    """

    API_BASE = "https://api.patentsview.org/patents/query"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            source_name="USPTO-API",
            reliability=0.96,
            category=SourceCategory.PATENTS,
            enabled=True,
            requires_api_key=False  # Free API
        )
        self.api_key = api_key or os.environ.get("USPTO_API_KEY")
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "TORON/2.5h+ Epistemic Engine (Patent Research)"
            }
            if self.api_key:
                headers["X-API-KEY"] = self.api_key
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=20),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            # Build PatentsView API query
            # Search in patent title and abstract
            query_params = {
                "q": {
                    "_or": [
                        {"_text_any": {"patent_title": query}},
                        {"_text_any": {"patent_abstract": query}}
                    ]
                },
                "f": [
                    "patent_number",
                    "patent_title",
                    "patent_abstract",
                    "patent_date",
                    "patent_type",
                    "inventor_first_name",
                    "inventor_last_name",
                    "assignee_organization"
                ],
                "o": {
                    "per_page": min(max_results, 100)
                },
                "s": [{"patent_date": "desc"}]
            }

            import json
            async with session.post(
                self.API_BASE,
                data=json.dumps(query_params)
            ) as response:
                if response.status == 429:
                    logger.warning("USPTO: Rate limited")
                    self._record_error()
                    return []

                if response.status != 200:
                    logger.warning(f"USPTO: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            patents = data.get("patents", [])

            for patent in patents[:max_results]:
                patent_number = patent.get("patent_number", "")
                title = patent.get("patent_title", "")
                abstract = patent.get("patent_abstract", "") or ""
                patent_date = patent.get("patent_date", "")
                patent_type = patent.get("patent_type", "")

                # Get inventors
                inventors = patent.get("inventors", [])
                inventor_names = []
                for inv in inventors[:3]:
                    first = inv.get("inventor_first_name", "")
                    last = inv.get("inventor_last_name", "")
                    if first and last:
                        inventor_names.append(f"{first} {last}")
                if len(inventors) > 3:
                    inventor_names.append(f"et al. ({len(inventors)} inventors)")
                inventor_str = ", ".join(inventor_names)

                # Get assignee
                assignees = patent.get("assignees", [])
                assignee = assignees[0].get("assignee_organization", "") if assignees else ""

                # Build content
                content_parts = [title]
                content_parts.append(f"Patent: US{patent_number}")
                if patent_date:
                    content_parts.append(f"Date: {patent_date}")
                if patent_type:
                    content_parts.append(f"Type: {patent_type}")
                if inventor_str:
                    content_parts.append(f"Inventors: {inventor_str}")
                if assignee:
                    content_parts.append(f"Assignee: {assignee}")
                if abstract:
                    content_parts.append(f"\n{abstract[:600]}")

                content = "\n".join(content_parts)

                url = f"https://patents.google.com/patent/US{patent_number}"

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=content[:1500],
                    reliability=self.reliability,
                    category=self.category,
                    url=url,
                    metadata={
                        "patent_number": f"US{patent_number}",
                        "title": title,
                        "date": patent_date,
                        "type": patent_type,
                        "assignee": assignee,
                        "type": "us_patent"
                    }
                )
                snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"USPTO error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
