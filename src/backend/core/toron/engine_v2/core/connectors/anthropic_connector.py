"""
Anthropic Connector — Claude 3.5 family.
Fully async using AsyncAnthropic.
"""

from anthropic import AsyncAnthropic
import os
import asyncio
from .base_connector import BaseConnector
from ..message_normalizer import MessageNormalizer


class AnthropicConnector(BaseConnector):
    def __init__(self):
        self.client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    async def infer(self, messages, model, **kwargs):
        retries = 3
        system, normalized = MessageNormalizer.to_anthropic_format(messages)

        for attempt in range(retries):
            try:
                resp = await self.client.messages.create(
                    model=model,
                    system=system,
                    messages=normalized,
                    max_tokens=kwargs.get("max_tokens", 2048),
                    temperature=kwargs.get("temperature", 0.7),
                )

                return resp, {
                    "provider": "anthropic",
                    "model": model,
                    "usage": {
                        "input_tokens": resp.usage.input_tokens,
                        "output_tokens": resp.usage.output_tokens
                    }
                }

            except Exception as e:
                if attempt == retries - 1:
                    raise Exception(f"Anthropic error: {str(e)}")
                await asyncio.sleep(2 ** attempt)

    async def stream(self, messages, model, **kwargs):
        async with self.client.messages.stream(
            model=model,
            messages=messages,
            max_tokens=kwargs.get("max_tokens", 2048)
        ) as s:
            async for t in s.text_stream:
                yield t

    async def list_models(self):
        return [
            {"model_id": "claude-3-5-sonnet-20241022"},
            {"model_id": "claude-3-5-haiku-20241022"},
        ]

    async def health_check(self):
        return True
