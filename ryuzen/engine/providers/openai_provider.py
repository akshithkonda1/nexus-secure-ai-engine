"""
OpenAI provider for TORON v2.5h+

Supports GPT-4, GPT-4 Turbo, and other OpenAI models via direct API.
"""

from __future__ import annotations

import hashlib
import logging
import time
from typing import Any, Dict, Optional

import openai
from openai import AsyncOpenAI

from .base import BaseProvider, ProviderConfig, ProviderResponse

logger = logging.getLogger("ryuzen.providers.openai")


class OpenAIProvider(BaseProvider):
    """
    OpenAI provider for GPT models.

    Supported models:
    - GPT-4o: gpt-4o
    - GPT-4 Turbo: gpt-4-turbo
    - GPT-4: gpt-4
    - o1/o1-mini: o1, o1-mini (reasoning models)
    """

    # Model ID mappings
    OPENAI_MODEL_MAP = {
        "ChatGPT-5.2": "gpt-4o",  # Placeholder for future models
        "GPT-4o": "gpt-4o",
        "GPT-4-Turbo": "gpt-4-turbo",
        "o1": "o1",
        "o1-mini": "o1-mini",
    }

    def __init__(self, config: ProviderConfig, api_key: Optional[str] = None):
        super().__init__(config)

        self._client = AsyncOpenAI(
            api_key=api_key,
            timeout=config.timeout_seconds,
            max_retries=3,
        )

    async def generate(self, prompt: str) -> ProviderResponse:
        """Generate response using OpenAI API."""
        start_time = time.time()

        try:
            # Build messages
            messages = [{"role": "user", "content": prompt}]

            # Call OpenAI API
            response = await self._client.chat.completions.create(
                model=self.model_id,
                messages=messages,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
            )

            # Extract content
            content = response.choices[0].message.content or ""
            tokens_used = (response.usage.total_tokens if response.usage else 0)

            latency_ms = int((time.time() - start_time) * 1000)
            self._record_success(latency_ms)

            # Compute fingerprint
            fingerprint = hashlib.sha256(content.encode()).hexdigest()[:16]

            # Estimate confidence
            confidence = self._estimate_confidence(response)

            return ProviderResponse(
                model=self.model_name,
                content=content,
                confidence=confidence,
                latency_ms=latency_ms,
                tokens_used=tokens_used,
                fingerprint=fingerprint,
                metadata={
                    "provider": "openai",
                    "model_id": self.model_id,
                    "finish_reason": response.choices[0].finish_reason,
                },
            )

        except openai.APIError as e:
            self._record_error()
            logger.error(f"OpenAI API error for {self.model_name}: {e}")
            raise RuntimeError(f"OpenAI API error: {e}") from e
        except Exception as e:
            self._record_error()
            logger.error(f"OpenAI generation failed for {self.model_name}: {e}")
            raise RuntimeError(f"OpenAI generation failed: {e}") from e

    async def health_check(self) -> bool:
        """Check OpenAI API connectivity."""
        try:
            # Simple models list to verify API key
            await self._client.models.list()
            return True
        except Exception as e:
            logger.warning(f"OpenAI health check failed: {e}")
            return False

    def _estimate_confidence(self, response: Any) -> float:
        """Estimate confidence based on response characteristics."""
        base_confidence = 0.85

        # Adjust based on finish reason
        finish_reason = response.choices[0].finish_reason
        if finish_reason == "stop":
            base_confidence += 0.05
        elif finish_reason == "length":
            base_confidence -= 0.1
        elif finish_reason == "content_filter":
            base_confidence -= 0.2

        # Adjust based on token usage
        if response.usage:
            completion_tokens = response.usage.completion_tokens
            if completion_tokens < 20:
                base_confidence -= 0.1
            elif completion_tokens > 500:
                base_confidence += 0.05

        return min(1.0, max(0.0, base_confidence))
