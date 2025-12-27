"""Base classes for Tier 3 knowledge connectors."""

from __future__ import annotations

import asyncio
import logging
import time
from collections import deque
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Deque

logger = logging.getLogger(__name__)


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

        # Rate limiting tracking (sliding window) - Performance Optimization
        self._call_timestamps: Deque[float] = deque(maxlen=rate_limit_per_minute)
        self._rate_limit_window_seconds = 60.0
        self._backoff_multiplier = 1.0
        self._consecutive_rate_limits = 0

    async def _enforce_rate_limit(self) -> None:
        """
        Enforce rate limiting using sliding window algorithm.

        If we've hit the rate limit, sleep until we're under the limit.
        Implements exponential backoff for repeated rate limit violations.
        """
        now = time.time()

        # Remove timestamps outside the window
        cutoff = now - self._rate_limit_window_seconds
        while self._call_timestamps and self._call_timestamps[0] < cutoff:
            self._call_timestamps.popleft()

        # Check if we're at the limit
        if len(self._call_timestamps) >= self.rate_limit:
            # Calculate how long to wait
            oldest_call = self._call_timestamps[0]
            wait_time = self._rate_limit_window_seconds - (now - oldest_call)

            # Apply exponential backoff if we've hit rate limits repeatedly
            if self._consecutive_rate_limits > 0:
                self._backoff_multiplier = min(
                    8.0,  # Max 8x backoff
                    2.0 ** self._consecutive_rate_limits
                )
                wait_time *= self._backoff_multiplier

            self._consecutive_rate_limits += 1

            logger.warning(
                f"{self.source_name}: Rate limit reached "
                f"({len(self._call_timestamps)}/{self.rate_limit} calls/min), "
                f"sleeping {wait_time:.1f}s (backoff: {self._backoff_multiplier:.1f}x)"
            )

            await asyncio.sleep(wait_time)
        else:
            # Reset backoff if we're under the limit
            if self._consecutive_rate_limits > 0:
                logger.info(
                    f"{self.source_name}: Rate limit pressure relieved, "
                    f"resetting backoff"
                )
            self._consecutive_rate_limits = 0
            self._backoff_multiplier = 1.0

        # Record this call
        self._call_timestamps.append(time.time())

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

        # Calculate current rate limit usage (Performance Optimization)
        now = time.time()
        cutoff = now - self._rate_limit_window_seconds
        recent_calls = sum(1 for ts in self._call_timestamps if ts >= cutoff)
        rate_limit_usage = recent_calls / self.rate_limit if self.rate_limit > 0 else 0.0

        return {
            "source_name": self.source_name,
            "calls": self._call_count,
            "errors": self._error_count,
            "error_rate": error_rate,
            "enabled": self.enabled,
            "category": self.category.value,
            # Rate limit stats
            "rate_limit": {
                "limit_per_minute": self.rate_limit,
                "current_usage": recent_calls,
                "usage_percent": rate_limit_usage * 100,
                "backoff_multiplier": self._backoff_multiplier,
                "consecutive_limits": self._consecutive_rate_limits,
            }
        }

    async def close(self) -> None:
        """Close any open connections. Override in subclasses."""
        pass
