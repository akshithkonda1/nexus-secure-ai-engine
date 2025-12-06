"""Provider registry for Toron V2 web search connectors."""

from __future__ import annotations

from typing import Dict, Type

from .web_connectors_base import toron_logger
from .wikipedia_search_provider import WikipediaSearchProvider


class GoogleSearchProvider:
    """Placeholder Google provider (implementation supplied elsewhere)."""

    def search(self, claim: str) -> Dict[str, str]:  # pragma: no cover - placeholder
        toron_logger.info("GoogleSearchProvider invoked")
        return {}


class DuckDuckGoProvider:
    """Placeholder DuckDuckGo provider."""

    def search(self, claim: str) -> Dict[str, str]:  # pragma: no cover - placeholder
        toron_logger.info("DuckDuckGoProvider invoked")
        return {}


class TavilySearchProvider:
    """Placeholder Tavily provider."""

    def search(self, claim: str) -> Dict[str, str]:  # pragma: no cover - placeholder
        toron_logger.info("TavilySearchProvider invoked")
        return {}


class DeterministicFallbackProvider:
    """Deterministic fallback provider for predictable responses."""

    def search(self, claim: str) -> Dict[str, str]:
        toron_logger.info("DeterministicFallbackProvider invoked")
        return {"source": "deterministic://fallback", "content": claim[:256] if claim else ""}


PROVIDER_SEQUENCE = [
    "GoogleSearchProvider",
    "DuckDuckGoProvider",
    "TavilySearchProvider",
    "WikipediaSearchProvider",
    "DeterministicFallbackProvider",
]

PROVIDER_REGISTRY: Dict[str, Type] = {
    "GoogleSearchProvider": GoogleSearchProvider,
    "DuckDuckGoProvider": DuckDuckGoProvider,
    "TavilySearchProvider": TavilySearchProvider,
    "WikipediaSearchProvider": WikipediaSearchProvider,
    "DeterministicFallbackProvider": DeterministicFallbackProvider,
}
