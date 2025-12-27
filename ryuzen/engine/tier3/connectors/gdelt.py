"""GDELT connector for global event data."""

import logging
from typing import List
import aiohttp
from datetime import datetime

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class GDELTConnector(Tier3Connector):
    """
    GDELT API connector for global event database.

    Uses GDELT DOC 2.0 API for news and event monitoring.
    API docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
    Free API, no authentication required.
    """

    API_BASE = "https://api.gdeltproject.org/api/v2/doc/doc"

    def __init__(self):
        super().__init__(
            source_name="GDELT",
            reliability=0.83,
            category=SourceCategory.NEWS,
            enabled=True,
            requires_api_key=False  # Free API
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "User-Agent": "TORON/2.5h+ Epistemic Engine (News Research)"
            }
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=20),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            # GDELT DOC 2.0 API parameters
            params = {
                "query": query,
                "mode": "artlist",
                "maxrecords": min(max_results * 3, 250),  # Get more to filter
                "format": "json",
                "sort": "hybridrel",  # Relevance + recency
                "timespan": "30d",  # Last 30 days
            }

            async with session.get(self.API_BASE, params=params) as response:
                if response.status != 200:
                    logger.warning(f"GDELT: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            articles = data.get("articles", [])

            # Track seen URLs to avoid duplicates
            seen_urls = set()

            for article in articles:
                url = article.get("url", "")

                # Skip duplicates
                if url in seen_urls:
                    continue
                seen_urls.add(url)

                title = article.get("title", "")
                source_domain = article.get("domain", "")
                seendate = article.get("seendate", "")
                language = article.get("language", "")
                source_country = article.get("sourcecountry", "")
                socialimage = article.get("socialimage", "")

                # Calculate tone (GDELT provides tone score)
                tone = article.get("tone", 0)
                tone_description = ""
                if tone > 3:
                    tone_description = "Positive"
                elif tone < -3:
                    tone_description = "Negative"
                else:
                    tone_description = "Neutral"

                # Parse date
                date_str = ""
                if seendate:
                    try:
                        date_obj = datetime.strptime(seendate, "%Y%m%dT%H%M%SZ")
                        date_str = date_obj.strftime("%Y-%m-%d %H:%M")
                    except ValueError:
                        date_str = seendate[:8] if len(seendate) >= 8 else seendate

                # Build content
                content_parts = [title]
                if source_domain:
                    content_parts.append(f"Source: {source_domain}")
                if source_country:
                    content_parts.append(f"Country: {source_country}")
                if date_str:
                    content_parts.append(f"Date: {date_str}")
                if tone_description:
                    content_parts.append(f"Tone: {tone_description} ({tone:.1f})")
                if language and language != "English":
                    content_parts.append(f"Language: {language}")

                content = "\n".join(content_parts)

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=content[:1500],
                    reliability=self.reliability,
                    category=self.category,
                    url=url,
                    metadata={
                        "title": title,
                        "domain": source_domain,
                        "country": source_country,
                        "tone": tone,
                        "language": language,
                        "has_image": bool(socialimage),
                        "type": "gdelt_article"
                    }
                )
                snippets.append(snippet)

                if len(snippets) >= max_results:
                    break

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"GDELT error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
