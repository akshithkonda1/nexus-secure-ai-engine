"""Cloud adapter mapping providers to endpoints."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class CloudProviderAdapter:
    """Resolve upstream endpoints for configured providers."""

    endpoints: Dict[str, str] = field(
        default_factory=lambda: {
            "aws": "https://bedrock.us-east-1.amazonaws.com",
            "azure": "https://api.azure.com/openai",
            "gcp": "https://vertex.googleapis.com",
        }
    )

    def resolve(self, provider: str) -> str:
        provider = provider.lower()
        if provider not in self.endpoints:
            raise KeyError(f"Unknown provider {provider}")
        return self.endpoints[provider]

    def set_override(self, provider: str, endpoint: str) -> None:
        self.endpoints[provider.lower()] = endpoint.rstrip("/")
