"""Financial Times connector."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class FinancialTimesConnector(Tier3Connector):
    """Financial Times API connector for business news."""

    def __init__(self):
        super().__init__(
            source_name="FinancialTimes-API",
            reliability=0.87,
            category=SourceCategory.FINANCIAL,
            enabled=False,  # Disabled until implemented
            requires_api_key=True
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement Financial Times API integration
        # Requires enterprise subscription
        logger.debug(f"{self.source_name} not yet implemented")
        return []
