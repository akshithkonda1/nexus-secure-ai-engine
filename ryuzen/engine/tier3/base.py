"""Base classes for Tier 3 knowledge connectors."""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional


class SourceCategory(Enum):
    """Categories of knowledge sources."""
    GENERAL = "general"
    ACADEMIC = "academic"
    MEDICAL = "medical"
    TECHNICAL = "technical"
    GOVERNMENT = "government"
    NEWS = "news"
    PATENTS = "patents"
    SCIENCE = "science"
    PHILOSOPHY = "philosophy"
    SOCIAL = "social"
    FINANCIAL = "financial"
    LEGAL = "legal"


class QueryIntent(Enum):
    """Types of query intent for source selection."""
    RESEARCH = "research"
    FACT_CHECK = "fact_check"
    HOW_TO = "how_to"
    OPINION = "opinion"
    CURRENT_EVENTS = "current"
    DEFINITION = "definition"
    COMPUTATION = "computation"


@dataclass
class KnowledgeSnippet:
    """A piece of knowledge from an external source."""

    source_name: str
    content: str
    reliability: float  # 0.0-1.0 from SourceReliability registry
    category: SourceCategory
    url: Optional[str] = None
    timestamp: float = field(default_factory=time.time)
    metadata: dict = field(default_factory=dict)

    def __post_init__(self):
        if not 0.0 <= self.reliability <= 1.0:
            raise ValueError(f"Reliability must be [0, 1], got {self.reliability}")


class Tier3Connector:
    """
    Base class for all external knowledge source connectors.

    Each connector fetches knowledge from a specific external API.
    """

    def __init__(
        self,
        source_name: str,
        reliability: float,
        category: SourceCategory,
        enabled: bool = True,
        requires_api_key: bool = False,
        rate_limit_per_minute: int = 60
    ):
        self.source_name = source_name
        self.reliability = reliability
        self.category = category
        self.enabled = enabled
        self.requires_api_key = requires_api_key
        self.rate_limit = rate_limit_per_minute

        self._call_count = 0
        self._error_count = 0
        self._last_call_time = 0.0

    async def fetch(
        self,
        query: str,
        max_results: int = 3
    ) -> List[KnowledgeSnippet]:
        """
        Fetch knowledge snippets for the given query.

        Args:
            query: User query to search for
            max_results: Maximum number of snippets to return

        Returns:
            List of KnowledgeSnippet objects
        """
        raise NotImplementedError(f"{self.__class__.__name__} must implement fetch()")

    def _record_success(self) -> None:
        """Record a successful API call."""
        self._call_count += 1
        self._last_call_time = time.time()

    def _record_error(self) -> None:
        """Record a failed API call."""
        self._call_count += 1
        self._error_count += 1
        self._last_call_time = time.time()

    def get_stats(self) -> dict:
        """Get connector statistics."""
        error_rate = self._error_count / self._call_count if self._call_count > 0 else 0.0
        return {
            "source_name": self.source_name,
            "calls": self._call_count,
            "errors": self._error_count,
            "error_rate": error_rate,
            "enabled": self.enabled,
            "category": self.category.value,
        }

    async def close(self) -> None:
        """Close any open connections. Override in subclasses."""
        pass
