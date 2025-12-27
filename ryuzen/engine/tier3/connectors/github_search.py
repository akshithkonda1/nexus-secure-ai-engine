"""GitHub Code Search connector."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class GitHubSearchConnector(Tier3Connector):
    """
    GitHub Code Search API connector.

    API docs: https://docs.github.com/en/rest/search
    Requires GITHUB_TOKEN for higher rate limits (optional but recommended).
    """

    API_BASE = "https://api.github.com/search"

    def __init__(self, token: Optional[str] = None):
        super().__init__(
            source_name="GitHub-Code-Search",
            reliability=0.79,
            category=SourceCategory.TECHNICAL,
            enabled=True,
            requires_api_key=False  # Works without token, but rate limited
        )
        self.token = token or os.environ.get("GITHUB_TOKEN")
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "TORON/2.5h+ Epistemic Engine"
            }
            if self.token:
                headers["Authorization"] = f"Bearer {self.token}"
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15),
                headers=headers
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()
            snippets = []

            # Search repositories first
            repo_params = {
                "q": query,
                "per_page": min(max_results, 100),
                "sort": "stars",
                "order": "desc"
            }

            async with session.get(
                f"{self.API_BASE}/repositories",
                params=repo_params
            ) as response:
                if response.status == 403:
                    logger.warning("GitHub: Rate limited")
                    self._record_error()
                    return []

                if response.status == 200:
                    data = await response.json()
                    items = data.get("items", [])

                    for repo in items[:max_results]:
                        name = repo.get("full_name", "")
                        description = repo.get("description", "") or ""
                        stars = repo.get("stargazers_count", 0)
                        forks = repo.get("forks_count", 0)
                        language = repo.get("language", "")
                        url = repo.get("html_url", "")
                        topics = repo.get("topics", [])
                        license_info = repo.get("license", {}) or {}
                        license_name = license_info.get("name", "")
                        updated_at = repo.get("updated_at", "")

                        # Build content
                        content_parts = [f"Repository: {name}"]
                        if description:
                            content_parts.append(f"\n{description}")
                        content_parts.append(f"\nStars: {stars:,} | Forks: {forks:,}")
                        if language:
                            content_parts.append(f"Language: {language}")
                        if topics:
                            content_parts.append(f"Topics: {', '.join(topics[:5])}")
                        if license_name:
                            content_parts.append(f"License: {license_name}")
                        if updated_at:
                            content_parts.append(f"Updated: {updated_at[:10]}")

                        content = "\n".join(content_parts)

                        snippet = KnowledgeSnippet(
                            source_name=self.source_name,
                            content=content[:1500],
                            reliability=self.reliability,
                            category=self.category,
                            url=url,
                            metadata={
                                "repo_name": name,
                                "stars": stars,
                                "forks": forks,
                                "language": language,
                                "topics": topics,
                                "type": "github_repository"
                            }
                        )
                        snippets.append(snippet)

            # Also search code if we have room
            if len(snippets) < max_results:
                code_params = {
                    "q": query,
                    "per_page": min(max_results - len(snippets), 30)
                }

                async with session.get(
                    f"{self.API_BASE}/code",
                    params=code_params
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        items = data.get("items", [])

                        for item in items[:max_results - len(snippets)]:
                            name = item.get("name", "")
                            path = item.get("path", "")
                            repo = item.get("repository", {})
                            repo_name = repo.get("full_name", "")
                            url = item.get("html_url", "")

                            content = f"Code: {repo_name}/{path}"
                            content += f"\nFile: {name}"

                            snippet = KnowledgeSnippet(
                                source_name=self.source_name,
                                content=content[:1500],
                                reliability=self.reliability * 0.9,  # Slightly lower for code
                                category=self.category,
                                url=url,
                                metadata={
                                    "file_name": name,
                                    "path": path,
                                    "repo_name": repo_name,
                                    "type": "github_code"
                                }
                            )
                            snippets.append(snippet)

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"GitHub Search error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
