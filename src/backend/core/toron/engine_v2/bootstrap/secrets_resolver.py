"""
Secrets Resolver for Toron Engine v2.0.
Resolves AWS, Azure, GCP, and Direct API credentials
in correct priority order for multi-cloud orchestration.
"""

import os
import boto3

class SecretsResolver:

    def resolve_aws(self) -> bool:
        session = boto3.Session()
        return session.get_credentials() is not None

    def resolve_azure(self) -> bool:
        return bool(os.getenv("AZURE_OPENAI_ENDPOINT") and os.getenv("AZURE_OPENAI_KEY"))

    def resolve_gcp(self) -> bool:
        return bool(
            os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            or os.getenv("GOOGLE_CLOUD_PROJECT")
        )

    def resolve_direct_api(self, key_name: str):
        return os.getenv(key_name)
