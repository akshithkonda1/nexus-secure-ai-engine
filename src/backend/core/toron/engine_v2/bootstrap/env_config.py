"""
Environment configuration for Toron Engine v2.0.
Handles multi-cloud, debate parameters, validation preferences,
timeouts, and growth/cost/quality tuning knobs.
"""

from pydantic import BaseModel, Field
from typing import List

class EngineConfig(BaseModel):
    # QUALITY PARAMETERS
    max_debate_rounds: int = 2
    max_execution_time_ms: int = 4000
    enable_web_validation: bool = True

    # GROWTH PARAMETERS
    enable_state_tracking: bool = True
    reliability_decay_rate: float = 0.02
    reliability_growth_rate: float = 0.05

    # COST PARAMETERS
    max_token_budget: int = 8000
    prefer_low_cost_models: bool = True
    cache_ttl_seconds: int = 86400

    # CLOUD PROVIDERS
    enable_aws_bedrock: bool = True
    enable_azure_openai: bool = True
    enable_gcp_vertex: bool = True
    enable_direct_apis: bool = True

    provider_priority: List[str] = [
        "aws", "azure", "gcp", "openai", "anthropic"
    ]

    model_timeout_seconds: int = 12
    web_timeout_seconds: int = 8
