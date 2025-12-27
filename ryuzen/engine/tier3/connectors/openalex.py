"""OpenAlex connector for academic research graph."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class OpenAlexConnector(Tier3Connector):
    """OpenAlex API connector for academic research metadata."""

    def __init__(self):
        super().__init__(
            source_name="OpenAlex-API",
            reliability=0.88,
            category=SourceCategory.ACADEMIC,
            enabled=False,  # Disabled until implemented
            requires_api_key=False  # Free API
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement OpenAlex API integration
        # API docs: https://docs.openalex.org/
        logger.debug(f"{self.source_name} not yet implemented")
        return []
