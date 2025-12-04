"""
EngineConfig — runtime configuration for Toron Engine v2.0.

Controls:
- timeouts
- max tokens
- provider priority
- parallel debate limits
- enterprise model set
"""

import os


class EngineConfig:
    def __init__(self):
        self.max_tokens = int(os.getenv("TORON_MAX_TOKENS", "2048"))
        self.model_timeout_seconds = int(os.getenv("TORON_MODEL_TIMEOUT", "30"))
        self.max_parallel_models = int(os.getenv("TORON_MAX_PARALLEL_MODELS", "3"))

        # Provider priority (affects failover behavior)
        priority_raw = os.getenv(
            "TORON_PROVIDER_PRIORITY",
            "aws-bedrock,openai,anthropic,azure,gcp-vertex,mistral,groq"
        )
        self.provider_priority = [p.strip() for p in priority_raw.split(",")]

        # Enterprise level model set (full power)
        self.enterprise_model_list = [
            "gpt-4o",
            "claude-3-5-sonnet-20241022",
            "gemini-1.5-pro",
            "llama3-70b-8192",
            "mistral-large-latest",
        ]
