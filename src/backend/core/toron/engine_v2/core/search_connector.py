"""Sequential web search connector for Toron V2."""

from __future__ import annotations

from typing import Dict

from .WebConnectors import PROVIDER_REGISTRY, PROVIDER_SEQUENCE
from .web_connectors_base import toron_logger


def search_connector(claim: str) -> Dict[str, str]:
    """Run the configured web search providers in order until one succeeds."""

    if not claim or not claim.strip():
        toron_logger.warning("search_connector received empty claim")
        return {}

    for provider_name in PROVIDER_SEQUENCE:
        provider_cls = PROVIDER_REGISTRY.get(provider_name)
        if not provider_cls:
            toron_logger.error("search_connector missing provider: %s", provider_name)
            continue

        try:
            provider = provider_cls()
            toron_logger.info("search_connector invoking %s", provider_name)
            result = provider.search(claim)
            if result:
                toron_logger.info("search_connector returning result from %s", provider_name)
                return result
        except Exception as exc:  # noqa: BLE001
            toron_logger.error("search_connector provider %s failed: %s", provider_name, exc, exc_info=False)

    toron_logger.warning("search_connector exhausted providers without result")
    return {}
