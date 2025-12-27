"""SEC EDGAR connector for financial filings."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class SECEdgarConnector(Tier3Connector):
    """SEC EDGAR API connector for regulatory filings."""

    def __init__(self):
        super().__init__(
            source_name="SEC-EDGAR",
            reliability=0.97,
            category=SourceCategory.FINANCIAL,
            enabled=False,  # Disabled until implemented
            requires_api_key=False  # Free government API
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement SEC EDGAR API integration
        # API docs: https://www.sec.gov/edgar/sec-api-documentation
        logger.debug(f"{self.source_name} not yet implemented")
        return []
