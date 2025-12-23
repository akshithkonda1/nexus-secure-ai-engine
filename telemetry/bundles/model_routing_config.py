"""
Model routing configuration for multi-provider telemetry report generation.

Centralizes the mapping of TORON model names to their respective
cloud providers and model IDs for AI self-analysis report generation.
"""

from __future__ import annotations

from typing import Dict, List, Optional

# Model routing configuration
# Maps TORON model names to provider details
MODEL_ROUTING = {
    # Anthropic models via Bedrock
    "Claude-Sonnet-4.5": {
        "provider": "bedrock",
        "model_id": "anthropic.claude-sonnet-4-5-20250929",
    },
    "Claude-Opus-4.5": {
        "provider": "bedrock",
        "model_id": "anthropic.claude-opus-4-5-20250514",
    },

    # Cohere via Bedrock
    "Cohere-Command-R-Plus": {
        "provider": "bedrock",
        "model_id": "cohere.command-r-plus-v1:0",
    },

    # Google models via Google AI API
    "Google-Gemini-3": {
        "provider": "google",
        "model_id": "gemini-3-pro",
    },

    # Meta via Bedrock
    "Meta-Llama-4": {
        "provider": "bedrock",
        "model_id": "meta.llama4-maverick-instruct-v1:0",
    },

    # Perplexity via API
    "Perplexity-Sonar": {
        "provider": "perplexity",
        "model_id": "sonar",
        "api_base": "https://api.perplexity.ai",
    },

    # OpenAI via API
    "ChatGPT-5.2": {
        "provider": "openai",
        "model_id": "gpt-5.2",
    },

    # Kimi via Bedrock
    "Kimi-K2-Thinking": {
        "provider": "bedrock",
        "model_id": "kimi.k2-thinking-v1:0",
    },

    # DeepSeek via Bedrock
    "DeepSeek-R1": {
        "provider": "bedrock",
        "model_id": "deepseek.r1-v1:0",
    },

    # Mistral via Bedrock
    "Mistral-Large": {
        "provider": "bedrock",
        "model_id": "mistral.mistral-large-2407-v1:0",
    },

    # Qwen via Bedrock
    "Qwen3": {
        "provider": "bedrock",
        "model_id": "qwen.qwen3-instruct-v1:0",
    },
}

# Model name aliases for flexibility
MODEL_ALIASES = {
    "Gemini-3": "Google-Gemini-3",
    "Gemini-3-Pro": "Google-Gemini-3",
    "Llama-4": "Meta-Llama-4",
    "Llama-4-Maverick": "Meta-Llama-4",
    "Command-R-Plus": "Cohere-Command-R-Plus",
    "GPT-5.2": "ChatGPT-5.2",
    "ChatGPT-5": "ChatGPT-5.2",
    "K2-Thinking": "Kimi-K2-Thinking",
    "Kimi-K2": "Kimi-K2-Thinking",
    "R1": "DeepSeek-R1",
    "DeepSeek-R1-Reasoning": "DeepSeek-R1",
    "Mistral-Large-2407": "Mistral-Large",
    "Qwen-3": "Qwen3",
    "Qwen-3-Instruct": "Qwen3",
}


def get_model_routing(model_name: str) -> Optional[Dict[str, str]]:
    """
    Get routing configuration for a model.

    Args:
        model_name: Name of the model (supports aliases)

    Returns:
        Dict with provider, model_id, and optional api_base, or None if not found
    """
    # Check direct match first
    if model_name in MODEL_ROUTING:
        return MODEL_ROUTING[model_name]

    # Check aliases
    if model_name in MODEL_ALIASES:
        canonical_name = MODEL_ALIASES[model_name]
        return MODEL_ROUTING.get(canonical_name)

    return None


def add_model(
    model_name: str,
    provider: str,
    model_id: str,
    api_base: Optional[str] = None,
) -> None:
    """
    Dynamically add a model to routing configuration.

    Args:
        model_name: Name of the model
        provider: Provider name (bedrock, openai, google, perplexity)
        model_id: Provider-specific model ID
        api_base: Optional API base URL for non-Bedrock providers
    """
    routing_entry = {
        "provider": provider,
        "model_id": model_id,
    }

    if api_base:
        routing_entry["api_base"] = api_base

    MODEL_ROUTING[model_name] = routing_entry


def list_supported_models() -> List[str]:
    """
    Get list of all supported model names.

    Returns:
        List of model names (canonical names only, not aliases)
    """
    return sorted(MODEL_ROUTING.keys())


def get_provider_models(provider: str) -> List[str]:
    """
    Get all models for a specific provider.

    Args:
        provider: Provider name

    Returns:
        List of model names using that provider
    """
    return [
        name for name, config in MODEL_ROUTING.items()
        if config["provider"] == provider
    ]


__all__ = [
    "MODEL_ROUTING",
    "MODEL_ALIASES",
    "get_model_routing",
    "add_model",
    "list_supported_models",
    "get_provider_models",
]
