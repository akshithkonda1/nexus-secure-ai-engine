"""
AWS Bedrock Connector — Claude, Llama, Titan, Mistral.
"""

import boto3
import json
from .base_connector import BaseConnector

class BedrockConnector(BaseConnector):
    def __init__(self, region="us-east-1"):
        self.client = boto3.client("bedrock-runtime", region_name=region)

    async def infer(self, messages, model, **kwargs):
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "messages": messages
        }
        response = self.client.invoke_model(
            modelId=model,
            body=json.dumps(body)
        )
        output = json.loads(response["body"].read().decode())
        return output, {"provider": "aws", "model": model}

    async def stream(self, messages, model, **kwargs):
        yield {"streaming": False}

    async def list_models(self):
        return [{"model_id": "anthropic.claude-3-5-sonnet-20241022-v2:0"}]

    async def health_check(self):
        return True
