"""
Azure OpenAI Connector — GPT-4o, GPT-4 Turbo.
"""

import os
import openai
from .base_connector import BaseConnector

class AzureConnector(BaseConnector):

    def __init__(self):
        openai.api_key = os.getenv("AZURE_OPENAI_KEY")
        openai.api_base = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")

    async def infer(self, messages, model, **kwargs):
        completion = openai.chat.completions.create(
            model=self.deployment,
            messages=messages
        )
        return completion.choices[0].message, {"provider": "azure", "model": model}

    async def stream(self, messages, model, **kwargs):
        yield {"streaming": False}

    async def list_models(self):
        return [{"model_id": self.deployment}]

    async def health_check(self):
        try:
            return True
        except:
            return False
