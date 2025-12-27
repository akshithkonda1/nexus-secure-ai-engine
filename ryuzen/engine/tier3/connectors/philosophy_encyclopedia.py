"""Internet Encyclopedia of Philosophy connector."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class PhilosophyEncyclopediaConnector(Tier3Connector):
    """Internet Encyclopedia of Philosophy connector."""

    def __init__(self):
        super().__init__(
            source_name="Philosophy-Encyclopedia",
            reliability=0.89,
            category=SourceCategory.PHILOSOPHY,
            enabled=False,  # Disabled until implemented
            requires_api_key=False
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement IEP scraping or search integration
        # Website: https://iep.utm.edu/
        logger.debug(f"{self.source_name} not yet implemented")
        return []
