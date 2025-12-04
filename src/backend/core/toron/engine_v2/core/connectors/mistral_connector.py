"""
Mistral Connector — Mistral AI models.
"""

import httpx
import os
import asyncio
from .base_connector import BaseConnector
from ..message_normalizer import MessageNormalizer


class MistralConnector(BaseConnector):
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY")
        self.url = "https://api.mistral.ai/v1/chat/completions"

    async def infer(self, messages, model, **kwargs):
        retries = 3
        normalized = MessageNormalizer.normalize_for_provider(messages, "mistral")

        for attempt in range(retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as c:
                    r = await c.post(
                        self.url,
                        headers={"Authorization": f"Bearer {self.api_key}"},
                        json={
                            "model": model,
                            "messages": normalized,
                            "max_tokens": kwargs.get("max_tokens", 2048)
                        }
                    )
                r.raise_for_status()
                j = r.json()
                return j["choices"][0]["message"], {
                    "provider": "mistral",
                    "model": model
                }

            except Exception as e:
                if attempt == retries - 1:
                    raise Exception(f"Mistral error: {str(e)}")
                await asyncio.sleep(2 ** attempt)

    async def stream(self, messages, model, **kwargs):
        yield ""  # Placeholder for now (Mistral streaming can be added)

    async def list_models(self):
        return [{"model_id": "mistral-large-latest"}]

    async def health_check(self):
        return True
