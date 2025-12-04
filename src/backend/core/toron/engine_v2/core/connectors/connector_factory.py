"""
ConnectorFactory — constructs connectors based on available credentials.
"""

import os

from .bedrock_connector import BedrockConnector
from .openai_connector import OpenAIConnector
from .anthropic_connector import AnthropicConnector
from .azure_connector import AzureConnector
from .vertex_connector import VertexConnector
from .mistral_connector import MistralConnector
from .groq_connector import GroqConnector


class ConnectorFactory:
    @staticmethod
    def discover(providers: dict):
        connectors = {}

        if providers.get("aws"):
            connectors["aws-bedrock"] = BedrockConnector()

        if providers.get("openai"):
            connectors["openai"] = OpenAIConnector()

        if providers.get("anthropic"):
            connectors["anthropic"] = AnthropicConnector()

        if providers.get("azure"):
            connectors["azure"] = AzureConnector()

        if providers.get("gcp"):
            connectors["gcp-vertex"] = VertexConnector()

        if os.getenv("MISTRAL_API_KEY"):
            connectors["mistral"] = MistralConnector()

        if os.getenv("GROQ_API_KEY"):
            connectors["groq"] = GroqConnector()

        return connectors
