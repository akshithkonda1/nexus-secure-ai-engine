"""
Provider loader for TORON v2.5h+

Loads AI providers from AWS Secrets Manager and configures them.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

import boto3
from botocore.exceptions import ClientError

from .base import BaseProvider, ProviderConfig
from .aws_bedrock import AWSBedrockProvider
from .openai_provider import OpenAIProvider
from .google_provider import GoogleGeminiProvider
from .xai_provider import XAIGrokProvider
from .perplexity_provider import PerplexityProvider

logger = logging.getLogger("ryuzen.providers.loader")


# Default provider configurations (tier assignments match TORON architecture)
DEFAULT_PROVIDER_CONFIGS = [
    # Tier 1: General Models (9 models)
    {"model_name": "ChatGPT-5.2", "model_id": "gpt-4o", "style": "balanced", "tier": 1, "provider_class": "openai"},
    {"model_name": "Gemini-3", "model_id": "gemini-1.5-pro", "style": "creative", "tier": 1, "provider_class": "google"},
    {"model_name": "Cohere-CommandR+", "model_id": "cohere.command-r-plus-v1:0", "style": "analytical", "tier": 1, "provider_class": "bedrock"},
    {"model_name": "Meta-Llama-3.2", "model_id": "meta.llama3-2-90b-instruct-v1:0", "style": "technical", "tier": 1, "provider_class": "bedrock"},
    {"model_name": "Mistral-Large", "model_id": "mistral.mistral-large-2407-v1:0", "style": "precise", "tier": 1, "provider_class": "bedrock"},
    {"model_name": "Qwen", "model_id": "qwen-plus", "style": "multilingual", "tier": 1, "provider_class": "openai"},  # Via OpenAI-compatible
    {"model_name": "Claude-Sonnet-4.5", "model_id": "anthropic.claude-3-5-sonnet-20241022-v2:0", "style": "harmonious", "tier": 1, "provider_class": "bedrock"},
    {"model_name": "Perplexity-Sonar", "model_id": "sonar-pro", "style": "search", "tier": 1, "provider_class": "perplexity"},
    {"model_name": "Grok-4.1", "model_id": "grok-2", "style": "real-time-reasoning", "tier": 1, "provider_class": "xai"},

    # Tier 2: Reasoning Models (2 models)
    {"model_name": "Kimi-K2-Thinking", "model_id": "o1", "style": "reasoning", "tier": 2, "provider_class": "openai"},
    {"model_name": "DeepSeek-R1", "model_id": "deepseek-reasoner", "style": "chain-of-thought", "tier": 2, "provider_class": "openai"},

    # Tier 4: Judicial Model (1 model)
    {"model_name": "Claude-Opus-4", "model_id": "anthropic.claude-3-opus-20240229-v1:0", "style": "judicial", "tier": 4, "provider_class": "bedrock"},
]


class ProviderLoader:
    """
    Loads and configures AI providers from AWS Secrets Manager.

    Supports:
    - AWS Bedrock providers
    - Direct API providers (OpenAI, Google, xAI, Perplexity)
    - Simulation mode for testing
    """

    def __init__(
        self,
        secrets_id: str = "toron/api-keys",
        region: str = "us-east-1",
        use_simulation: bool = False,
    ):
        self.secrets_id = secrets_id
        self.region = region
        self.use_simulation = use_simulation
        self._secrets_client = boto3.client("secretsmanager", region_name=region)

    async def load_providers(self) -> List[BaseProvider]:
        """
        Load all configured providers.

        Returns:
            List of initialized provider instances
        """
        if self.use_simulation:
            logger.info("Simulation mode enabled - using mock responses")
            return self._load_simulation_providers()

        # Load API keys from Secrets Manager
        api_keys = self._load_secrets()

        if not api_keys:
            logger.warning("No API keys found - falling back to simulation mode")
            return self._load_simulation_providers()

        providers: List[BaseProvider] = []

        for config_data in DEFAULT_PROVIDER_CONFIGS:
            try:
                provider = self._create_provider(config_data, api_keys)
                if provider:
                    providers.append(provider)
                    logger.info(f"Loaded provider: {config_data['model_name']}")
            except Exception as e:
                logger.warning(f"Failed to load provider {config_data['model_name']}: {e}")

        logger.info(f"Loaded {len(providers)} providers")
        return providers

    def _load_secrets(self) -> Dict[str, str]:
        """Load API keys from AWS Secrets Manager."""
        try:
            response = self._secrets_client.get_secret_value(SecretId=self.secrets_id)

            if "SecretString" in response:
                return json.loads(response["SecretString"])
            else:
                logger.error("Secret does not contain SecretString")
                return {}

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            if error_code == "ResourceNotFoundException":
                logger.error(f"Secret not found: {self.secrets_id}")
            elif error_code == "AccessDeniedException":
                logger.error(f"Access denied to secret: {self.secrets_id}")
            else:
                logger.error(f"Failed to load secrets: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error loading secrets: {e}")
            return {}

    def _create_provider(
        self, config_data: Dict[str, Any], api_keys: Dict[str, str]
    ) -> Optional[BaseProvider]:
        """Create a provider instance from configuration."""
        provider_class = config_data["provider_class"]

        config = ProviderConfig(
            model_name=config_data["model_name"],
            model_id=config_data["model_id"],
            style=config_data["style"],
            tier=config_data["tier"],
            region=self.region,
        )

        if provider_class == "bedrock":
            # AWS Bedrock - uses IAM credentials
            return AWSBedrockProvider(config)

        elif provider_class == "openai":
            api_key = api_keys.get("OPENAI_API_KEY")
            if not api_key:
                logger.warning(f"No OpenAI API key for {config.model_name}")
                return None
            return OpenAIProvider(config, api_key=api_key)

        elif provider_class == "google":
            api_key = api_keys.get("GOOGLE_API_KEY")
            if not api_key:
                logger.warning(f"No Google API key for {config.model_name}")
                return None
            return GoogleGeminiProvider(config, api_key=api_key)

        elif provider_class == "xai":
            api_key = api_keys.get("XAI_API_KEY")
            if not api_key:
                logger.warning(f"No xAI API key for {config.model_name}")
                return None
            return XAIGrokProvider(config, api_key=api_key)

        elif provider_class == "perplexity":
            api_key = api_keys.get("PERPLEXITY_API_KEY")
            if not api_key:
                logger.warning(f"No Perplexity API key for {config.model_name}")
                return None
            return PerplexityProvider(config, api_key=api_key)

        else:
            logger.warning(f"Unknown provider class: {provider_class}")
            return None

    def _load_simulation_providers(self) -> List[BaseProvider]:
        """Load simulation providers for testing."""
        from .simulation import SimulationProvider

        providers = []
        for config_data in DEFAULT_PROVIDER_CONFIGS:
            config = ProviderConfig(
                model_name=config_data["model_name"],
                model_id=config_data["model_id"],
                style=config_data["style"],
                tier=config_data["tier"],
                region=self.region,
            )
            providers.append(SimulationProvider(config))

        logger.info(f"Loaded {len(providers)} simulation providers")
        return providers
