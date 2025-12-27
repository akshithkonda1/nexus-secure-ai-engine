"""CORE connector for open access research."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class COREConnector(Tier3Connector):
    """CORE API connector for open access research aggregation."""

    def __init__(self):
        super().__init__(
            source_name="CORE-API",
            reliability=0.86,
            category=SourceCategory.ACADEMIC,
            enabled=False,  # Disabled until implemented
            requires_api_key=True
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement CORE API integration
        # API docs: https://core.ac.uk/documentation/api
        logger.debug(f"{self.source_name} not yet implemented")
        return []
