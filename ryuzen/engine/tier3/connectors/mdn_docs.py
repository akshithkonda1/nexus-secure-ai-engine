"""MDN Web Docs connector."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class MDNDocsConnector(Tier3Connector):
    """MDN Web Docs connector for web development documentation."""

    def __init__(self):
        super().__init__(
            source_name="MDN-Web-Docs",
            reliability=0.90,
            category=SourceCategory.TECHNICAL,
            enabled=False,  # Disabled until implemented
            requires_api_key=False
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement MDN Web Docs search integration
        # Can scrape or use unofficial API
        logger.debug(f"{self.source_name} not yet implemented")
        return []
