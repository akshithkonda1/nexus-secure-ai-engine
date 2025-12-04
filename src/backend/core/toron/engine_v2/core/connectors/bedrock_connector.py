"""
AWS Bedrock Connector — Claude, Llama, Mistral, Titan
Fully async using aioboto3.
"""

import aioboto3
import json
import asyncio
from .base_connector import BaseConnector


class BedrockConnector(BaseConnector):
    def __init__(self, region="us-east-1"):
        self.region = region
        self.session = aioboto3.Session()

    async def infer(self, messages, model, **kwargs):
        retries = 3

        for attempt in range(retries):
            try:
                async with self.session.client(
                    "bedrock-runtime",
                    region_name=self.region
                ) as c:

                    body = {
                        "anthropic_version": "bedrock-2023-05-31",
                        "messages": messages,
                        "max_tokens": kwargs.get("max_tokens", 2048),
                        "temperature": kwargs.get("temperature", 0.7)
                    }

                    resp = await c.invoke_model(
                        modelId=model, body=json.dumps(body)
                    )

                    data = await resp["body"].read()
                    data = json.loads(data.decode())

                    return data, {
                        "provider": "aws-bedrock",
                        "model": model
                    }

            except Exception as e:
                if attempt == retries - 1:
                    raise Exception(f"Bedrock error: {str(e)}")
                await asyncio.sleep(2 ** attempt)

    async def stream(self, messages, model, **kwargs):
        async with self.session.client(
            "bedrock-runtime",
            region_name=self.region
        ) as c:

            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "messages": messages,
                "max_tokens": kwargs.get("max_tokens", 2048)
            }

            stream = await c.invoke_model_with_response_stream(
                modelId=model, body=json.dumps(body)
            )

            async for event in stream.get("body"):
                chunk = json.loads(event["chunk"]["bytes"])
                if "delta" in chunk and "text" in chunk["delta"]:
                    yield chunk["delta"]["text"]

    async def list_models(self):
        return [
            {"model_id": "anthropic.claude-3-5-sonnet-20241022-v2:0"},
            {"model_id": "meta.llama3-70b-instruct-v1:0"},
            {"model_id": "mistral.mistral-large-v1:0"},
        ]

    async def health_check(self):
        try:
            async with self.session.client(
                "bedrock-runtime", region_name=self.region
            ):
                return True
        except Exception:
            return False
