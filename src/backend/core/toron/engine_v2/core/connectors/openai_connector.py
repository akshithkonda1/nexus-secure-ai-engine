"""
OpenAI API Connector — GPT-4o, 4o-mini
"""

import openai
import os
from .base_connector import BaseConnector

class OpenAIConnector(BaseConnector):

    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")

    async def infer(self, messages, model, **kwargs):
        response = openai.chat.completions.create(
            model=model,
            messages=messages
        )
        return response.choices[0].message, {"provider": "openai", "model": model}

    async def stream(self, messages, model, **kwargs):
        yield {"streaming": False}

    async def list_models(self):
        return [{"model_id": "gpt-4o"}, {"model_id": "gpt-4o-mini"}]

    async def health_check(self):
        return True
