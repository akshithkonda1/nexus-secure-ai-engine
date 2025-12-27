"""
Perplexity provider for TORON v2.5h+

Supports Perplexity Sonar models for search-grounded responses.
"""

from __future__ import annotations

import hashlib
import logging
import time
from typing import Any, Dict, List, Optional

import httpx

from .base import BaseProvider, ProviderConfig, ProviderResponse

logger = logging.getLogger("ryuzen.providers.perplexity")


class PerplexityProvider(BaseProvider):
    """
    Perplexity provider for search-grounded AI responses.

    Supported models:
    - Sonar Pro: sonar-pro
    - Sonar: sonar
    - Sonar Reasoning: sonar-reasoning
    """

    API_BASE = "https://api.perplexity.ai"

    # Model ID mappings
    PERPLEXITY_MODEL_MAP = {
        "Perplexity-Sonar": "sonar-pro",
        "Sonar-Pro": "sonar-pro",
        "Sonar": "sonar",
        "Sonar-Reasoning": "sonar-reasoning",
    }

    def __init__(self, config: ProviderConfig, api_key: Optional[str] = None):
        super().__init__(config)
        self._api_key = api_key
        self._client = httpx.AsyncClient(
            timeout=config.timeout_seconds,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

    async def generate(self, prompt: str) -> ProviderResponse:
        """Generate response using Perplexity API."""
        start_time = time.time()

        try:
            # Build request
            payload = {
                "model": self.model_id,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": self.config.max_tokens,
                "temperature": self.config.temperature,
            }

            # Call Perplexity API
            response = await self._client.post(
                f"{self.API_BASE}/chat/completions",
                json=payload,
            )
            response.raise_for_status()

            data = response.json()

            # Extract content
            content = data["choices"][0]["message"]["content"]
            tokens_used = data.get("usage", {}).get("total_tokens", 0)

            # Extract citations if available
            citations = self._extract_citations(data)

            latency_ms = int((time.time() - start_time) * 1000)
            self._record_success(latency_ms)

            # Compute fingerprint
            fingerprint = hashlib.sha256(content.encode()).hexdigest()[:16]

            # Estimate confidence (higher for search-grounded responses)
            confidence = self._estimate_confidence(data, content, citations)

            return ProviderResponse(
                model=self.model_name,
                content=content,
                confidence=confidence,
                latency_ms=latency_ms,
                tokens_used=tokens_used,
                fingerprint=fingerprint,
                metadata={
                    "provider": "perplexity",
                    "model_id": self.model_id,
                    "finish_reason": data["choices"][0].get("finish_reason"),
                    "citations": citations,
                    "search_grounded": len(citations) > 0,
                },
            )

        except httpx.HTTPError as e:
            self._record_error()
            logger.error(f"Perplexity API error for {self.model_name}: {e}")
            raise RuntimeError(f"Perplexity API error: {e}") from e
        except Exception as e:
            self._record_error()
            logger.error(f"Perplexity generation failed for {self.model_name}: {e}")
            raise RuntimeError(f"Perplexity generation failed: {e}") from e

    async def health_check(self) -> bool:
        """Check Perplexity API connectivity."""
        try:
            # Simple test request
            response = await self._client.post(
                f"{self.API_BASE}/chat/completions",
                json={
                    "model": self.model_id,
                    "messages": [{"role": "user", "content": "test"}],
                    "max_tokens": 10,
                },
            )
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Perplexity health check failed: {e}")
            return False

    def _extract_citations(self, data: Dict[str, Any]) -> List[str]:
        """Extract citations from Perplexity response."""
        citations = []

        # Check for citations in response metadata
        if "citations" in data:
            citations = data["citations"]
        elif "choices" in data:
            choice = data["choices"][0]
            if "message" in choice and "citations" in choice["message"]:
                citations = choice["message"]["citations"]

        return citations

    def _estimate_confidence(
        self, data: Dict[str, Any], content: str, citations: List[str]
    ) -> float:
        """Estimate confidence based on response characteristics."""
        base_confidence = 0.85

        # Boost confidence for search-grounded responses
        if citations:
            citation_boost = min(0.1, len(citations) * 0.02)
            base_confidence += citation_boost

        # Adjust based on finish reason
        finish_reason = data["choices"][0].get("finish_reason", "")
        if finish_reason == "stop":
            base_confidence += 0.03
        elif finish_reason == "length":
            base_confidence -= 0.1

        # Adjust based on content
        word_count = len(content.split())
        if word_count < 10:
            base_confidence -= 0.1
        elif word_count > 200:
            base_confidence += 0.03

        return min(1.0, max(0.0, base_confidence))

    async def close(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()
