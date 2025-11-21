"""Model routing utilities for Toron Engine."""
from __future__ import annotations

from typing import Dict, List


class ModelRouter:
    """Routes requests to the appropriate model backend.

    The router keeps a static registry of models for simplicity but exposes a
    minimal API that can be swapped for a dynamic service discovery layer.
    """

    def __init__(self, models: List[Dict[str, str]] | None = None) -> None:
        default_models = [
            {"name": "toron-primary", "provider": "openai", "mode": "chat"},
            {"name": "toron-guard", "provider": "openai", "mode": "guard"},
            {"name": "toron-research", "provider": "anthropic", "mode": "analysis"},
        ]
        self._models = models or default_models

    def get_models(self) -> List[Dict[str, str]]:
        """Return the currently available model catalog."""

        return list(self._models)

    def select_model(self, plan: Dict[str, str]) -> Dict[str, str]:
        """Select a model based on the provided execution plan."""

        for candidate in self._models:
            if candidate.get("mode") == plan.get("mode"):
                return candidate
        return self._models[0]
