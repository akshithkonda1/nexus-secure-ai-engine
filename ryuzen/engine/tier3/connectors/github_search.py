"""GitHub Code Search connector."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class GitHubSearchConnector(Tier3Connector):
    """GitHub Code Search API connector."""

    def __init__(self):
        super().__init__(
            source_name="GitHub-Code-Search",
            reliability=0.79,
            category=SourceCategory.TECHNICAL,
            enabled=False,  # Disabled until implemented
            requires_api_key=True
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement GitHub Search API integration
        # API docs: https://docs.github.com/en/rest/search
        logger.debug(f"{self.source_name} not yet implemented")
        return []
