"""
Groq Connector — Groq LPU-accelerated models.
"""

import httpx
import os
import asyncio
from .base_connector import BaseConnector


class GroqConnector(BaseConnector):
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.url = "https://api.groq.com/openai/v1/chat/completions"

    async def infer(self, messages, model, **kwargs):
        retries = 3

        for attempt in range(retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as c:
                    r = await c.post(
                        self.url,
                        headers={"Authorization": f"Bearer {self.api_key}"},
                        json={
                            "model": model,
                            "messages": messages,
                            "max_tokens": kwargs.get("max_tokens", 2048)
                        }
                    )
                r.raise_for_status()
                data = r.json()
                return data["choices"][0]["message"], {
                    "provider": "groq",
                    "model": model
                }

            except Exception as e:
                if attempt == retries - 1:
                    raise Exception(f"Groq error: {str(e)}")
                await asyncio.sleep(2 ** attempt)

    async def stream(self, messages, model, **kwargs):
        yield ""  # Groq streaming optional

    async def list_models(self):
        return [
            {"model_id": "llama3-70b-8192"},
            {"model_id": "mixtral-8x7b"},
        ]

    async def health_check(self):
        return True
