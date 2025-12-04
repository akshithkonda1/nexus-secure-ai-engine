"""
Groq API Connector — ultra-fast inference
"""

from groq import Groq
import os
from .base_connector import BaseConnector

class GroqConnector(BaseConnector):

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    async def infer(self, messages, model, **kwargs):
        response = self.client.chat.completions.create(
            model=model,
            messages=messages
        )
        return response.choices[0].message, {"provider": "groq", "model": model}

    async def stream(self, messages, model, **kwargs):
        yield {"streaming": False}

    async def list_models(self):
        return [{"model_id": "llama3-70b"}, {"model_id": "mixtral-8x7b"}]

    async def health_check(self):
        return True
