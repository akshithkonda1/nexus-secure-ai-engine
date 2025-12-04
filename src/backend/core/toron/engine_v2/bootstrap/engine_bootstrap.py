"""
EngineBootstrap — detects cloud providers available to Toron.

Checks credentials for:
- AWS Bedrock
- Azure OpenAI
- GCP Vertex AI
- OpenAI Direct
- Anthropic
- Mistral
- Groq
"""

import os
import boto3
from google.auth import default as gcp_default
from azure.identity import DefaultAzureCredential


class EngineBootstrap:
    def initialize(self):
        providers = {
            "aws": False,
            "azure": False,
            "gcp": False,
            "openai": False,
            "anthropic": False,
            "mistral": False,
            "groq": False,
        }

        # -----------------------------
        # AWS detection
        # -----------------------------
        try:
            boto3.Session().get_credentials()
            providers["aws"] = True
        except Exception:
            pass

        # -----------------------------
        # Azure detection
        # -----------------------------
        if os.getenv("AZURE_OPENAI_KEY") and os.getenv("AZURE_OPENAI_ENDPOINT"):
            providers["azure"] = True
        else:
            try:
                DefaultAzureCredential()
                providers["azure"] = True
            except Exception:
                pass

        # -----------------------------
        # GCP detection
        # -----------------------------
        try:
            creds, proj = gcp_default()
            if proj:
                providers["gcp"] = True
        except Exception:
            pass

        # -----------------------------
        # Direct APIs
        # -----------------------------
        if os.getenv("OPENAI_API_KEY"):
            providers["openai"] = True

        if os.getenv("ANTHROPIC_API_KEY"):
            providers["anthropic"] = True

        if os.getenv("MISTRAL_API_KEY"):
            providers["mistral"] = True

        if os.getenv("GROQ_API_KEY"):
            providers["groq"] = True

        return providers
