"""Reddit connector for community knowledge."""

import logging
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class RedditConnector(Tier3Connector):
    """Reddit API connector for community discussions."""

    API_BASE = "https://www.reddit.com"

    def __init__(self):
        super().__init__(
            source_name="Reddit-API",
            reliability=0.72,
            category=SourceCategory.SOCIAL,
            enabled=True
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {"User-Agent": "TORON/2.5h+ (Epistemic Search Engine)"}
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=10),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()
            url = f"{self.API_BASE}/search.json"
            params = {"q": query, "limit": max_results * 2, "sort": "relevance", "type": "link"}

            async with session.get(url, params=params) as response:
                if response.status != 200:
                    logger.warning(f"Reddit: {response.status} for {query[:30]}...")
                    self._record_error()
                    return []

                data = await response.json()

            posts = data.get("data", {}).get("children", [])
            snippets = []

            for post in posts[:max_results]:
                post_data = post.get("data", {})
                title = post_data.get("title", "")
                selftext = post_data.get("selftext", "")
                content = f"{title}\n\n{selftext}" if selftext else title

                if not content.strip():
                    continue

                # Skip removed/deleted posts
                if "[removed]" in content or "[deleted]" in content:
                    continue

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=content[:1500],
                    reliability=self.reliability,
                    category=self.category,
                    url=f"https://reddit.com{post_data.get('permalink', '')}",
                    metadata={
                        "subreddit": post_data.get("subreddit", ""),
                        "score": post_data.get("score", 0),
                        "num_comments": post_data.get("num_comments", 0),
                        "upvote_ratio": post_data.get("upvote_ratio", 0),
                    }
                )
                snippets.append(snippet)

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"Reddit error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
