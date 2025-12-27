"""News API connector."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class NewsAPIConnector(Tier3Connector):
    """NewsAPI.org connector for news aggregation."""

    def __init__(self):
        super().__init__(
            source_name="NewsAPI",
            reliability=0.78,
            category=SourceCategory.NEWS,
            enabled=False,  # Disabled until implemented
            requires_api_key=True
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement NewsAPI integration
        # API docs: https://newsapi.org/docs
        logger.debug(f"{self.source_name} not yet implemented")
        return []
