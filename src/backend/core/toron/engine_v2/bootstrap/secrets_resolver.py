"""
SecretsResolver — loads secrets from:
- AWS Secrets Manager
- environment variables (fallback)
"""

import os
import json
import boto3


class SecretsResolver:
    def __init__(self):
        self.client = boto3.client(
            "secretsmanager",
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )

    def get(self, key):
        """
        Attempts to load key from:
        1. AWS Secrets Manager
        2. Local environment variables
        """

        # Try environment first
        env_val = os.getenv(key)
        if env_val:
            return env_val

        # Try AWS Secrets Manager
        try:
            resp = self.client.get_secret_value(SecretId=key)
            payload = resp.get("SecretString")
            if payload:
                try:
                    j = json.loads(payload)
                    return j.get(key, payload)
                except Exception:
                    return payload
        except Exception:
            pass

        return None
