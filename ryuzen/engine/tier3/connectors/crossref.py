"""CrossRef connector for academic citations."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class CrossRefConnector(Tier3Connector):
    """CrossRef API connector for DOI and citation metadata."""

    def __init__(self):
        super().__init__(
            source_name="CrossRef-API",
            reliability=0.89,
            category=SourceCategory.ACADEMIC,
            enabled=False,  # Disabled until implemented
            requires_api_key=False  # Free API
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement CrossRef API integration
        # API docs: https://api.crossref.org/swagger-ui/index.html
        logger.debug(f"{self.source_name} not yet implemented")
        return []
