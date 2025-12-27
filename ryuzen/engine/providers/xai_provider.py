"""
xAI Grok provider for TORON v2.5h+

Supports Grok models via xAI API.
"""

from __future__ import annotations

import hashlib
import logging
import time
from typing import Any, Dict, Optional

import httpx

from .base import BaseProvider, ProviderConfig, ProviderResponse

logger = logging.getLogger("ryuzen.providers.xai")


class XAIGrokProvider(BaseProvider):
    """
    xAI Grok provider for real-time reasoning.

    Supported models:
    - Grok-2: grok-2
    - Grok-2-mini: grok-2-mini
    - Grok-beta: grok-beta
    """

    API_BASE = "https://api.x.ai/v1"

    # Model ID mappings
    XAI_MODEL_MAP = {
        "Grok-4.1": "grok-2",  # Placeholder for future models
        "Grok-2": "grok-2",
        "Grok-2-mini": "grok-2-mini",
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
        """Generate response using xAI Grok API."""
        start_time = time.time()

        try:
            # Build request
            payload = {
                "model": self.model_id,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": self.config.max_tokens,
                "temperature": self.config.temperature,
            }

            # Call xAI API
            response = await self._client.post(
                f"{self.API_BASE}/chat/completions",
                json=payload,
            )
            response.raise_for_status()

            data = response.json()

            # Extract content
            content = data["choices"][0]["message"]["content"]
            tokens_used = data.get("usage", {}).get("total_tokens", 0)

            latency_ms = int((time.time() - start_time) * 1000)
            self._record_success(latency_ms)

            # Compute fingerprint
            fingerprint = hashlib.sha256(content.encode()).hexdigest()[:16]

            # Estimate confidence
            confidence = self._estimate_confidence(data, content)

            return ProviderResponse(
                model=self.model_name,
                content=content,
                confidence=confidence,
                latency_ms=latency_ms,
                tokens_used=tokens_used,
                fingerprint=fingerprint,
                metadata={
                    "provider": "xai",
                    "model_id": self.model_id,
                    "finish_reason": data["choices"][0].get("finish_reason"),
                },
            )

        except httpx.HTTPError as e:
            self._record_error()
            logger.error(f"xAI API error for {self.model_name}: {e}")
            raise RuntimeError(f"xAI API error: {e}") from e
        except Exception as e:
            self._record_error()
            logger.error(f"xAI generation failed for {self.model_name}: {e}")
            raise RuntimeError(f"xAI generation failed: {e}") from e

    async def health_check(self) -> bool:
        """Check xAI API connectivity."""
        try:
            response = await self._client.get(f"{self.API_BASE}/models")
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"xAI health check failed: {e}")
            return False

    def _estimate_confidence(self, data: Dict[str, Any], content: str) -> float:
        """Estimate confidence based on response characteristics."""
        base_confidence = 0.86  # Grok has high reliability for real-time

        # Adjust based on finish reason
        finish_reason = data["choices"][0].get("finish_reason", "")
        if finish_reason == "stop":
            base_confidence += 0.04
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
