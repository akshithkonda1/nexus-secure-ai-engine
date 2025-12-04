"""
Anthropic API Connector — Claude, Haiku
"""

import anthropic
import os
from .base_connector import BaseConnector

class AnthropicConnector(BaseConnector):
    def __init__(self):
        self.client = anthropic.Client(api_key=os.getenv("ANTHROPIC_API_KEY"))

    async def infer(self, messages, model, **kwargs):
        response = self.client.messages.create(
            model=model,
            messages=messages
        )
        return response, {"provider": "anthropic", "model": model}

    async def stream(self, messages, model, **kwargs):
        yield {"streaming": False}

    async def list_models(self):
        return [{"model_id": "claude-3-5-sonnet"}, {"model_id": "claude-3-haiku"}]

    async def health_check(self):
        return True
