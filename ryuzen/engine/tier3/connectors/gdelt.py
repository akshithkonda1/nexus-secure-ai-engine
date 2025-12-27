"""GDELT connector for global event data."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class GDELTConnector(Tier3Connector):
    """GDELT API connector for global event database."""

    def __init__(self):
        super().__init__(
            source_name="GDELT",
            reliability=0.83,
            category=SourceCategory.NEWS,
            enabled=False,  # Disabled until implemented
            requires_api_key=False  # Free API
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement GDELT API integration
        # API docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
        logger.debug(f"{self.source_name} not yet implemented")
        return []
