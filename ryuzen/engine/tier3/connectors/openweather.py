"""OpenWeather connector for weather data."""

import logging
from typing import List

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class OpenWeatherConnector(Tier3Connector):
    """OpenWeather API connector for meteorological data."""

    def __init__(self):
        super().__init__(
            source_name="OpenWeather-API",
            reliability=0.88,
            category=SourceCategory.SCIENCE,
            enabled=False,  # Disabled until implemented
            requires_api_key=True
        )

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        # TODO: Implement OpenWeather API integration
        # API docs: https://openweathermap.org/api
        logger.debug(f"{self.source_name} not yet implemented")
        return []
