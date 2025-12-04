"""
Azure OpenAI Connector — GPT-4o via Azure deployment.
"""

import os
import asyncio
from openai import AsyncAzureOpenAI
from .base_connector import BaseConnector
from ..message_normalizer import MessageNormalizer


class AzureConnector(BaseConnector):
    def __init__(self):
        self.client = AsyncAzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_KEY"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01")
        )
        self.deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")

    async def infer(self, messages, model, **kwargs):
        retries = 3
        normalized = MessageNormalizer.normalize_for_provider(messages, "azure")

        for attempt in range(retries):
            try:
                resp = await self.client.chat.completions.create(
                    model=self.deployment,
                    messages=normalized,
                    max_tokens=kwargs.get("max_tokens", 2048),
                )

                return resp.choices[0].message, {
                    "provider": "azure",
                    "model": model,
                    "deployment": self.deployment,
                    "usage": {
                        "prompt_tokens": resp.usage.prompt_tokens,
                        "completion_tokens": resp.usage.completion_tokens,
                        "total_tokens": resp.usage.total_tokens
                    }
                }

            except Exception as e:
                if attempt == retries - 1:
                    raise Exception(f"Azure error: {str(e)}")
                await asyncio.sleep(2 ** attempt)

    async def stream(self, messages, model, **kwargs):
        stream = await self.client.chat.completions.create(
            model=self.deployment,
            messages=messages,
            stream=True,
            max_tokens=kwargs.get("max_tokens", 2048)
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def list_models(self):
        return [{"model_id": self.deployment}]

    async def health_check(self):
        try:
            await self.client.models.list()
            return True
        except Exception:
            return False
