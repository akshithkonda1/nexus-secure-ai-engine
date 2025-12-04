"""
Google Vertex AI Connector — Gemini Pro, Flash
"""

import os
from google.cloud import aiplatform
from .base_connector import BaseConnector

class VertexConnector(BaseConnector):

    def __init__(self):
        aiplatform.init(project=os.getenv("GOOGLE_CLOUD_PROJECT"))
        self.model_name = "publishers/google/models/gemini-pro"

    async def infer(self, messages, model, **kwargs):
        client = aiplatform.gapic.PredictionServiceClient()
        instance = {"content": messages[-1]["content"]}

        response = client.predict(
            endpoint=self.model_name,
            instances=[instance]
        )
        return response.predictions[0], {"provider": "gcp", "model": model}

    async def stream(self, messages, model, **kwargs):
        yield {"streaming": False}

    async def list_models(self):
        return [{"model_id": self.model_name}]

    async def health_check(self):
        return True
