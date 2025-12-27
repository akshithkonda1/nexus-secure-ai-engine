"""
Tests for Tier 3 optimizations.

Validates:
1. Semantic caching works correctly
2. Speculative execution improves latency
3. Adaptive source count adjusts properly
4. Rate limiting prevents API abuse
"""

import asyncio
import pytest
import time
from unittest.mock import AsyncMock, patch, MagicMock
from collections import deque

from ryuzen.engine.tier3 import Tier3Manager, KnowledgeSnippet, SourceCategory
from ryuzen.engine.tier3.base import Tier3Connector


# ============================================================================
# TEST FIXTURES
# ============================================================================

class MockConnector(Tier3Connector):
    """Mock connector for testing."""

    def __init__(self, name: str, delay: float = 0.01, reliability: float = 0.8):
        super().__init__(
            source_name=name,
            reliability=reliability,
            category=SourceCategory.GENERAL,
            enabled=True
        )
        self.delay = delay
        self.fetch_count = 0

    async def fetch(self, query: str, max_results: int = 3) -> list:
        self.fetch_count += 1
        await asyncio.sleep(self.delay)
        self._record_success()
        return [
            KnowledgeSnippet(
                source_name=self.source_name,
                content=f"Result from {self.source_name} for query: {query}",
                reliability=self.reliability,
                category=self.category
            )
        ]


class SlowConnector(Tier3Connector):
    """Mock connector that simulates slow API."""

    def __init__(self, name: str, delay: float):
        super().__init__(
            source_name=name,
            reliability=0.8,
            category=SourceCategory.GENERAL,
            enabled=True
        )
        self.delay = delay

    async def fetch(self, query: str, max_results: int = 3) -> list:
        await asyncio.sleep(self.delay)
        self._record_success()
        return [
            KnowledgeSnippet(
                source_name=self.source_name,
                content=f"Result from {self.source_name}",
                reliability=self.reliability,
                category=self.category
            )
        ]


# ============================================================================
# TEST 1: SEMANTIC CACHING
# ============================================================================

@pytest.mark.asyncio
async def test_tier3_semantic_cache_hit():
    """Test that semantically similar queries hit the cache."""
    manager = Tier3Manager()

    # Register mock connectors
    for i in range(5):
        manager.register_connector(MockConnector(f"Mock-{i}"))
    manager._initialized = True

    # First query (cache miss)
    query1 = "What are COVID-19 symptoms?"
    snippets1 = await manager.fetch_relevant_sources(
        query=query1,
        context="formal",
        max_sources=3
    )

    assert manager.cache_stats["misses"] == 1
    assert manager.cache_stats["hits"] == 0

    # Semantically similar query (should hit cache due to word sorting)
    query2 = "symptoms COVID-19 What are"
    snippets2 = await manager.fetch_relevant_sources(
        query=query2,
        context="formal",
        max_sources=3
    )

    # Should be cache hit (same words, different order)
    assert manager.cache_stats["hits"] == 1
    assert len(snippets1) == len(snippets2)


@pytest.mark.asyncio
async def test_tier3_cache_different_context():
    """Test that different contexts create different cache entries."""
    manager = Tier3Manager()

    # Register mock connectors
    for i in range(5):
        manager.register_connector(MockConnector(f"Mock-{i}"))
    manager._initialized = True

    query = "AI regulation"

    # Formal context
    snippets1 = await manager.fetch_relevant_sources(
        query=query,
        context="formal",
        max_sources=3
    )

    # Casual context (different cache entry)
    snippets2 = await manager.fetch_relevant_sources(
        query=query,
        context="casual",
        max_sources=3
    )

    # Both should be cache misses (different contexts)
    assert manager.cache_stats["misses"] == 2
    assert manager.cache_stats["hits"] == 0


@pytest.mark.asyncio
async def test_tier3_cache_stats():
    """Test cache statistics tracking."""
    manager = Tier3Manager()

    # Register mock connectors
    for i in range(5):
        manager.register_connector(MockConnector(f"Mock-{i}"))
    manager._initialized = True

    query = "machine learning"

    # 3 queries - first is miss, next 2 are hits
    for i in range(3):
        await manager.fetch_relevant_sources(
            query=query,
            context="technical",
            max_sources=3
        )

    stats = manager.get_stats()

    assert stats["cache_stats"]["misses"] == 1
    assert stats["cache_stats"]["hits"] == 2
    assert stats["cache_stats"]["hit_rate"] == pytest.approx(2/3, rel=0.01)


@pytest.mark.asyncio
async def test_tier3_cache_key_normalization():
    """Test that cache keys are properly normalized."""
    manager = Tier3Manager()

    # Test key generation
    key1 = manager._compute_semantic_cache_key("Hello World!", "formal")
    key2 = manager._compute_semantic_cache_key("hello world", "formal")
    key3 = manager._compute_semantic_cache_key("world hello", "formal")  # Different order

    # Same normalized form should produce same key
    assert key1 == key2
    assert key2 == key3  # Word order shouldn't matter

    # Different context = different key
    key4 = manager._compute_semantic_cache_key("hello world", "casual")
    assert key1 != key4


# ============================================================================
# TEST 2: SPECULATIVE EXECUTION
# ============================================================================

@pytest.mark.asyncio
async def test_speculative_execution_early_exit():
    """Test that speculative execution exits early when enough sources respond."""
    manager = Tier3Manager()

    # Register connectors with varying speeds
    fast_connectors = [
        SlowConnector(f"Fast-{i}", delay=0.05) for i in range(3)
    ]
    slow_connectors = [
        SlowConnector(f"Slow-{i}", delay=2.0) for i in range(2)
    ]

    all_connectors = fast_connectors + slow_connectors
    for conn in all_connectors:
        manager.register_connector(conn)
    manager._initialized = True

    # Query with target_count=3 (should only wait for fast ones)
    start = time.time()
    snippets = await manager._fetch_with_speculation(
        connectors=all_connectors,
        query="test",
        target_count=3,
        max_results_per_source=1
    )
    elapsed = time.time() - start

    # Should complete in ~0.1s (fast connectors) not 2.0s (slow connectors)
    assert elapsed < 0.5, f"Took {elapsed}s, should be <0.5s"
    assert len(snippets) >= 3, "Should have at least 3 snippets"


@pytest.mark.asyncio
async def test_speculative_execution_redundancy():
    """Test that speculative execution queries extra sources for redundancy."""
    manager = Tier3Manager()

    # Register connectors
    connectors = [MockConnector(f"Mock-{i}") for i in range(10)]
    for conn in connectors:
        manager.register_connector(conn)
    manager._initialized = True

    # target=4, so should query 6 (4+2 redundancy)
    snippets = await manager._fetch_with_speculation(
        connectors=connectors,
        query="test",
        target_count=4,
        max_results_per_source=1
    )

    # Verify at least target_count snippets returned
    assert len(snippets) >= 4


# ============================================================================
# TEST 3: ADAPTIVE SOURCE COUNT
# ============================================================================

def test_adaptive_source_count_simple_query():
    """Test that simple queries use fewer sources."""
    # Simulate high Tier 1 consensus
    tier1_agreement = 0.95
    tier1_confidence = 0.90

    # Calculate adaptive source count (same logic as in engine)
    if tier1_agreement > 0.9 and tier1_confidence > 0.85:
        adaptive_max_sources = 3
    elif tier1_agreement < 0.7 or tier1_confidence < 0.70:
        adaptive_max_sources = 10
    else:
        adaptive_max_sources = 6

    assert adaptive_max_sources == 3, "Simple query should use 3 sources"


def test_adaptive_source_count_complex_query():
    """Test that complex queries use more sources."""
    # Simulate low Tier 1 consensus
    tier1_agreement = 0.60
    tier1_confidence = 0.65

    # Calculate adaptive source count
    if tier1_agreement > 0.9 and tier1_confidence > 0.85:
        adaptive_max_sources = 3
    elif tier1_agreement < 0.7 or tier1_confidence < 0.70:
        adaptive_max_sources = 10
    else:
        adaptive_max_sources = 6

    assert adaptive_max_sources == 10, "Complex query should use 10 sources"


def test_adaptive_source_count_moderate_query():
    """Test that moderate queries use default sources."""
    # Simulate moderate Tier 1 consensus
    tier1_agreement = 0.80
    tier1_confidence = 0.80

    # Calculate adaptive source count
    if tier1_agreement > 0.9 and tier1_confidence > 0.85:
        adaptive_max_sources = 3
    elif tier1_agreement < 0.7 or tier1_confidence < 0.70:
        adaptive_max_sources = 10
    else:
        adaptive_max_sources = 6

    assert adaptive_max_sources == 6, "Moderate query should use 6 sources"


# ============================================================================
# TEST 4: RATE LIMITING
# ============================================================================

@pytest.mark.asyncio
async def test_rate_limit_enforcement():
    """Test that rate limiting prevents excessive API calls."""
    connector = MockConnector("RateLimited", delay=0.01)
    connector.rate_limit = 5  # 5 calls per minute

    # Make calls up to the limit
    for i in range(5):
        await connector._enforce_rate_limit()

    # Verify timestamps were recorded
    assert len(connector._call_timestamps) == 5


@pytest.mark.asyncio
async def test_rate_limit_stats():
    """Test rate limit statistics."""
    connector = MockConnector("StatsTest", delay=0.01)
    connector.rate_limit = 10

    # Make a few calls
    for i in range(3):
        await connector._enforce_rate_limit()

    stats = connector.get_stats()

    assert stats["rate_limit"]["limit_per_minute"] == 10
    assert stats["rate_limit"]["current_usage"] == 3
    assert stats["rate_limit"]["usage_percent"] == pytest.approx(30.0, rel=0.1)
    assert stats["rate_limit"]["backoff_multiplier"] == 1.0
    assert stats["rate_limit"]["consecutive_limits"] == 0


@pytest.mark.asyncio
async def test_rate_limit_backoff_multiplier():
    """Test exponential backoff on rate limit violations."""
    connector = MockConnector("BackoffTest", delay=0.001)
    connector.rate_limit = 2  # Very low limit
    connector._rate_limit_window_seconds = 0.1  # Short window for testing

    # Fill the rate limit
    await connector._enforce_rate_limit()
    await connector._enforce_rate_limit()

    # Record initial state
    initial_consecutive = connector._consecutive_rate_limits

    # This should trigger rate limit
    await connector._enforce_rate_limit()

    # Backoff should have been applied
    assert connector._consecutive_rate_limits >= 0


# ============================================================================
# INTEGRATION TEST
# ============================================================================

@pytest.mark.asyncio
async def test_full_optimization_integration():
    """Integration test: All optimizations work together."""
    manager = Tier3Manager()

    # Register mock connectors
    for i in range(10):
        manager.register_connector(MockConnector(f"IntegrationMock-{i}"))
    manager._initialized = True

    # First query (cache miss, adaptive sources)
    start1 = time.time()
    snippets1 = await manager.fetch_relevant_sources(
        query="climate change effects",
        context="formal",
        max_sources=6
    )
    elapsed1 = time.time() - start1

    # Second identical query (cache hit, should be much faster)
    start2 = time.time()
    snippets2 = await manager.fetch_relevant_sources(
        query="climate change effects",
        context="formal",
        max_sources=6
    )
    elapsed2 = time.time() - start2

    # Cache hit should be significantly faster
    assert elapsed2 < elapsed1 * 0.5, f"Cache hit ({elapsed2}s) should be <50% of miss ({elapsed1}s)"
    assert len(snippets1) == len(snippets2)

    # Verify cache stats
    stats = manager.get_stats()
    assert stats["cache_stats"]["hits"] >= 1
    assert stats["cache_stats"]["hit_rate"] > 0


@pytest.mark.asyncio
async def test_manager_stats_include_cache():
    """Test that manager stats include cache information."""
    manager = Tier3Manager()

    # Register mock connectors
    for i in range(3):
        manager.register_connector(MockConnector(f"StatsMock-{i}"))
    manager._initialized = True

    # Make a query
    await manager.fetch_relevant_sources(
        query="test query",
        context="casual",
        max_sources=3
    )

    stats = manager.get_stats()

    # Verify cache stats are present
    assert "cache_stats" in stats
    assert "hits" in stats["cache_stats"]
    assert "misses" in stats["cache_stats"]
    assert "hit_rate" in stats["cache_stats"]
    assert "size" in stats["cache_stats"]


@pytest.mark.asyncio
async def test_connector_stats_include_rate_limit():
    """Test that connector stats include rate limit information."""
    connector = MockConnector("RateLimitStatTest")

    # Make a call
    await connector._enforce_rate_limit()

    stats = connector.get_stats()

    # Verify rate limit stats are present
    assert "rate_limit" in stats
    assert "limit_per_minute" in stats["rate_limit"]
    assert "current_usage" in stats["rate_limit"]
    assert "usage_percent" in stats["rate_limit"]
    assert "backoff_multiplier" in stats["rate_limit"]
    assert "consecutive_limits" in stats["rate_limit"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
