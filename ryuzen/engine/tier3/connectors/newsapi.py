"""News API connector."""

import logging
import os
from typing import List, Optional
import aiohttp
from datetime import datetime, timedelta

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class NewsAPIConnector(Tier3Connector):
    """
    NewsAPI.org connector for news aggregation.

    API docs: https://newsapi.org/docs
    Requires API key from https://newsapi.org/register
    """

    API_BASE = "https://newsapi.org/v2"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            source_name="NewsAPI",
            reliability=0.78,
            category=SourceCategory.NEWS,
            enabled=True,
            requires_api_key=True
        )
        self.api_key = api_key or os.environ.get("NEWSAPI_API_KEY")
        self._session = None

        if not self.api_key:
            logger.warning("NewsAPI: Missing API key, connector will return empty results")

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {}
            if self.api_key:
                headers["X-Api-Key"] = self.api_key
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        if not self.api_key:
            logger.debug("NewsAPI: No API key configured")
            return []

        try:
            session = await self._get_session()
            snippets = []

            # Calculate date range (last 30 days for free tier)
            to_date = datetime.now()
            from_date = to_date - timedelta(days=30)

            params = {
                "q": query,
                "language": "en",
                "sortBy": "relevancy",
                "pageSize": min(max_results, 100),
                "from": from_date.strftime("%Y-%m-%d"),
                "to": to_date.strftime("%Y-%m-%d")
            }

            # Use /everything endpoint for comprehensive search
            async with session.get(
                f"{self.API_BASE}/everything",
                params=params
            ) as response:
                if response.status == 401:
                    logger.warning("NewsAPI: Invalid API key")
                    self._record_error()
                    return []

                if response.status == 429:
                    logger.warning("NewsAPI: Rate limited")
                    self._record_error()
                    return []

                if response.status != 200:
                    logger.warning(f"NewsAPI: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            if data.get("status") != "ok":
                logger.warning(f"NewsAPI error: {data.get('message', 'Unknown error')}")
                self._record_error()
                return []

            articles = data.get("articles", [])

            for article in articles[:max_results]:
                title = article.get("title", "")
                description = article.get("description", "") or ""
                content = article.get("content", "") or ""
                source = article.get("source", {})
                source_name = source.get("name", "")
                author = article.get("author", "")
                url = article.get("url", "")
                published_at = article.get("publishedAt", "")
                image_url = article.get("urlToImage", "")

                # Clean the content (NewsAPI truncates at 200 chars)
                if content:
                    content = content.replace("[+", "").replace(" chars]", "")
                    # Remove trailing truncation markers
                    content = content.rstrip("0123456789")

                # Build content
                content_parts = [title]
                if source_name:
                    content_parts.append(f"Source: {source_name}")
                if author:
                    content_parts.append(f"Author: {author}")
                if published_at:
                    # Parse and format date
                    try:
                        pub_date = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
                        content_parts.append(f"Published: {pub_date.strftime('%Y-%m-%d %H:%M')}")
                    except ValueError:
                        content_parts.append(f"Published: {published_at[:10]}")
                if description:
                    content_parts.append(f"\n{description}")

                article_content = "\n".join(content_parts)

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=article_content[:1500],
                    reliability=self.reliability,
                    category=self.category,
                    url=url,
                    metadata={
                        "title": title,
                        "source": source_name,
                        "author": author,
                        "published_at": published_at,
                        "has_image": bool(image_url),
                        "type": "news_article"
                    }
                )
                snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"NewsAPI error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
