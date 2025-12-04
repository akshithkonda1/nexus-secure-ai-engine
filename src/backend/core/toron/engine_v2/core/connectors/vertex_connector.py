"""
Vertex AI Connector — Gemini 1.5 (sync SDK wrapped async).
"""

import os
import asyncio
from google.cloud import aiplatform
from .base_connector import BaseConnector


class VertexConnector(BaseConnector):
    def __init__(self):
        project = os.getenv("GOOGLE_CLOUD_PROJECT")
        region = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")
        aiplatform.init(project=project, location=region)
        self.project = project
        self.region = region

    async def infer(self, messages, model, **kwargs):
        def call():
            from vertexai.generative_models import GenerativeModel
            m = GenerativeModel(model)
            prompt = messages[-1]["content"]
            return m.generate_content(prompt).text

        try:
            text = await asyncio.to_thread(call)
            return {"content": text}, {
                "provider": "gcp-vertex",
                "model": model
            }
        except Exception as e:
            raise Exception(f"Vertex error: {str(e)}")

    async def stream(self, messages, model, **kwargs):
        def sync_gen():
            from vertexai.generative_models import GenerativeModel
            m = GenerativeModel(model)
            prompt = messages[-1]["content"]
            for chunk in m.generate_content(prompt, stream=True):
                yield chunk.text

        for piece in await asyncio.to_thread(lambda: list(sync_gen())):
            yield piece

    async def list_models(self):
        return [
            {"model_id": "gemini-1.5-pro"},
            {"model_id": "gemini-1.5-flash"},
        ]

    async def health_check(self):
        return True
