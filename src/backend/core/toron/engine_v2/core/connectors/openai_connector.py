"""
OpenAI Connector — GPT-4o, GPT-4o-mini, GPT-4 Turbo
Uses AsyncOpenAI client.
"""

from openai import AsyncOpenAI
import os
import asyncio
from .base_connector import BaseConnector
from ..message_normalizer import MessageNormalizer


class OpenAIConnector(BaseConnector):
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def infer(self, messages, model, **kwargs):
        retries = 3
        normalized = MessageNormalizer.normalize_for_provider(messages, "openai")

        for attempt in range(retries):
            try:
                resp = await self.client.chat.completions.create(
                    model=model,
                    messages=normalized,
                    max_tokens=kwargs.get("max_tokens", 2048),
                    temperature=kwargs.get("temperature", 0.7),
                    timeout=kwargs.get("timeout", 30.0)
                )

                data = resp.choices[0].message

                return data, {
                    "provider": "openai",
                    "model": model,
                    "usage": {
                        "prompt_tokens": resp.usage.prompt_tokens,
                        "completion_tokens": resp.usage.completion_tokens,
                        "total_tokens": resp.usage.total_tokens
                    }
                }

            except Exception as e:
                if attempt == retries - 1:
                    raise Exception(f"OpenAI error: {str(e)}")
                await asyncio.sleep(2 ** attempt)

    async def stream(self, messages, model, **kwargs):
        stream = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
            max_tokens=kwargs.get("max_tokens", 2048)
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def list_models(self):
        return [
            {"model_id": "gpt-4o"},
            {"model_id": "gpt-4o-mini"},
            {"model_id": "gpt-4-turbo"},
        ]

    async def health_check(self):
        try:
            await self.client.models.list()
            return True
        except Exception:
            return False
