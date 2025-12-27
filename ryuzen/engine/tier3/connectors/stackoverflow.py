"""StackOverflow connector for technical Q&A."""

import logging
from typing import List
import aiohttp
import html

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class StackOverflowConnector(Tier3Connector):
    """StackOverflow API for technical questions and answers."""

    API_BASE = "https://api.stackexchange.com/2.3"

    def __init__(self):
        super().__init__(
            source_name="StackOverflow-API",
            reliability=0.82,
            category=SourceCategory.TECHNICAL,
            enabled=True
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=10)
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            # Search for questions
            params = {
                "order": "desc",
                "sort": "relevance",
                "intitle": query,
                "site": "stackoverflow",
                "filter": "withbody",
                "pagesize": max_results * 2
            }

            url = f"{self.API_BASE}/search/advanced"

            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.warning(f"StackOverflow: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            for item in data.get("items", [])[:max_results]:
                title = html.unescape(item.get("title", ""))
                body = item.get("body_markdown", "") or item.get("body", "")
                # Clean up HTML if present
                body = html.unescape(body)
                body = body[:800]  # Limit body length

                question_id = item.get("question_id")
                is_answered = item.get("is_answered", False)
                score = item.get("score", 0)
                view_count = item.get("view_count", 0)
                answer_count = item.get("answer_count", 0)

                # Get tags
                tags = item.get("tags", [])

                content = f"Q: {title}\n\n{body}"
                url_link = f"https://stackoverflow.com/questions/{question_id}"

                # Adjust reliability based on question quality
                adjusted_reliability = self.reliability
                if is_answered and score > 10:
                    adjusted_reliability = min(0.90, self.reliability + 0.05)
                elif score < 0:
                    adjusted_reliability = max(0.60, self.reliability - 0.10)

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=content[:1500],
                    reliability=adjusted_reliability,
                    category=self.category,
                    url=url_link,
                    metadata={
                        "score": score,
                        "is_answered": is_answered,
                        "view_count": view_count,
                        "answer_count": answer_count,
                        "tags": tags[:5],
                    }
                )
                snippets.append(snippet)

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"StackOverflow error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
