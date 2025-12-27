"""
Abstract base provider for TORON v2.5h+

Defines the interface all AI providers must implement.
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class ProviderConfig:
    """Configuration for an AI provider."""

    model_name: str
    model_id: str  # API-specific model identifier
    style: str  # Response style: "balanced", "reasoning", "search", etc.
    max_tokens: int = 4096
    temperature: float = 0.7
    timeout_seconds: float = 30.0

    # Cloud-specific settings
    cloud: str = "aws"  # "aws", "azure", "gcp", "direct"
    region: str = "us-east-1"

    # Tier classification
    tier: int = 1  # 1=general, 2=reasoning, 3=knowledge, 4=judicial

    # Performance characteristics
    base_latency_ms: int = 300
    error_rate: float = 0.02


@dataclass
class ProviderResponse:
    """Standardized response from an AI provider."""

    model: str
    content: str
    confidence: float  # 0.0-1.0
    latency_ms: int
    tokens_used: int
    fingerprint: str
    timestamp: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError(f"Confidence must be [0, 1], got {self.confidence}")
        if self.latency_ms < 0:
            raise ValueError(f"Latency cannot be negative: {self.latency_ms}")


class BaseProvider(ABC):
    """
    Abstract base class for all AI providers.

    All providers (AWS Bedrock, OpenAI, Google, etc.) must implement this interface.
    """

    def __init__(self, config: ProviderConfig):
        self.config = config
        self.model_name = config.model_name
        self.model_id = config.model_id
        self._call_count = 0
        self._total_latency = 0.0
        self._error_count = 0

    @abstractmethod
    async def generate(self, prompt: str) -> ProviderResponse:
        """
        Generate a response for the given prompt.

        Args:
            prompt: User input prompt

        Returns:
            ProviderResponse with model output

        Raises:
            RuntimeError: If generation fails
        """
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if the provider is healthy and accessible.

        Returns:
            True if healthy, False otherwise
        """
        pass

    def get_stats(self) -> Dict[str, Any]:
        """Get performance statistics for this provider."""
        avg_latency = self._total_latency / self._call_count if self._call_count > 0 else 0.0
        error_rate = self._error_count / self._call_count if self._call_count > 0 else 0.0

        return {
            "model_name": self.model_name,
            "calls": self._call_count,
            "avg_latency_ms": avg_latency,
            "error_count": self._error_count,
            "error_rate": error_rate,
        }

    def _record_success(self, latency_ms: float) -> None:
        """Record a successful call."""
        self._call_count += 1
        self._total_latency += latency_ms

    def _record_error(self) -> None:
        """Record a failed call."""
        self._call_count += 1
        self._error_count += 1

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(model={self.model_name})"
