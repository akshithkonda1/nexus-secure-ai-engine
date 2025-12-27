"""Britannica connector - Expert encyclopedia."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class BritannicaConnector(Tier3Connector):
    """Britannica API connector for expert encyclopedia content."""

    def __init__(self):
        super().__init__(
            source_name="Britannica-API",
            reliability=1.0,
            category=SourceCategory.GENERAL,
            enabled=False,  # Disabled until implemented
            requires_api_key=True
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement Britannica API integration
        # Requires API key from: https://britannica.com/webservices
        logger.debug(f"{self.source_name} not yet implemented")
        return []
