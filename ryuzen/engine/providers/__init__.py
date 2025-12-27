"""
Real AI provider integrations for TORON v2.5h+

Supports multi-cloud deployments:
- AWS Bedrock (8 models)
- Direct APIs (OpenAI, Google, xAI, Perplexity)
- Azure OpenAI (optional)
- GCP Vertex AI (optional)
"""

from .base import BaseProvider, ProviderConfig, ProviderResponse
from .aws_bedrock import AWSBedrockProvider
from .openai_provider import OpenAIProvider
from .google_provider import GoogleGeminiProvider
from .xai_provider import XAIGrokProvider
from .perplexity_provider import PerplexityProvider
from .loader import ProviderLoader
from .simulation import SimulationProvider

__all__ = [
    "BaseProvider",
    "ProviderConfig",
    "ProviderResponse",
    "AWSBedrockProvider",
    "OpenAIProvider",
    "GoogleGeminiProvider",
    "XAIGrokProvider",
    "PerplexityProvider",
    "ProviderLoader",
    "SimulationProvider",
]
