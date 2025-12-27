"""NASA connector for space and science data."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class NASAConnector(Tier3Connector):
    """NASA API connector for space and science data."""

    def __init__(self):
        super().__init__(
            source_name="NASA-API",
            reliability=0.98,
            category=SourceCategory.SCIENCE,
            enabled=False,  # Disabled until implemented
            requires_api_key=True  # Free API key required
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement NASA API integration
        # API docs: https://api.nasa.gov/
        logger.debug(f"{self.source_name} not yet implemented")
        return []
