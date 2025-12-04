from __future__ import annotations

import os

import pytest


pytestmark = pytest.mark.integration


def _bedrock_client():
    if not os.getenv("BEDROCK_RUNTIME_ENDPOINT"):
        pytest.skip("Bedrock runtime not configured")
    boto3 = pytest.importorskip("boto3")
    return boto3.client(
        "bedrock-runtime",
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
        endpoint_url=os.getenv("BEDROCK_RUNTIME_ENDPOINT"),
    )


def test_bedrock_live_configuration():
    client = _bedrock_client()
    assert client.meta.endpoint_url == os.getenv("BEDROCK_RUNTIME_ENDPOINT")
