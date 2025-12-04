"""
Mistral API Connector — Mixtral, Mistral Large
"""

from mistralai import Mistral
import os
from .base_connector import BaseConnector

class MistralConnector(BaseConnector):
    def __init__(self):
        self.client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

    async def infer(self, messages, model, **kwargs):
        response = self.client.chat.complete(
            model=model,
            messages=messages
        )
        return response, {"provider": "mistral", "model": model}

    async def stream(self, messages, model, **kwargs):
        yield {"streaming": False}

    async def list_models(self):
        return [{"model_id": "mistral-large"}]

    async def health_check(self):
        return True
