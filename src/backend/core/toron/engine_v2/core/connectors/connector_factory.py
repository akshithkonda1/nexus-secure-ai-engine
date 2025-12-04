"""
ConnectorFactory — auto-detect available providers.
"""

import os
from .bedrock_connector import BedrockConnector
from .azure_connector import AzureConnector
from .vertex_connector import VertexConnector
from .openai_connector import OpenAIConnector
from .anthropic_connector import AnthropicConnector
from .mistral_connector import MistralConnector
from .groq_connector import GroqConnector

class ConnectorFactory:

    @staticmethod
    def discover(providers):
        connectors = {}

        if providers.get("aws"):
            connectors["aws"] = BedrockConnector()

        if providers.get("azure"):
            connectors["azure"] = AzureConnector()

        if providers.get("gcp"):
            connectors["gcp"] = VertexConnector()

        if os.getenv("OPENAI_API_KEY"):
            connectors["openai"] = OpenAIConnector()

        if os.getenv("ANTHROPIC_API_KEY"):
            connectors["anthropic"] = AnthropicConnector()

        if os.getenv("MISTRAL_API_KEY"):
            connectors["mistral"] = MistralConnector()

        if os.getenv("GROQ_API_KEY"):
            connectors["groq"] = GroqConnector()

        return connectors
