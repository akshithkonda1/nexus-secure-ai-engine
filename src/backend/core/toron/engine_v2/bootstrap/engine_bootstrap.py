"""
Engine Bootstrap for Toron v2.0.
Initializes cloud provider availability and engine config.
"""

from .env_config import EngineConfig
from .secrets_resolver import SecretsResolver

class EngineBootstrap:
    def __init__(self):
        self.config = EngineConfig()
        self.secrets = SecretsResolver()

    def initialize(self):
        providers = {
            "aws": self.secrets.resolve_aws() and self.config.enable_aws_bedrock,
            "azure": self.secrets.resolve_azure() and self.config.enable_azure_openai,
            "gcp": self.secrets.resolve_gcp() and self.config.enable_gcp_vertex,
            "direct": self.config.enable_direct_apis
        }
        return providers
