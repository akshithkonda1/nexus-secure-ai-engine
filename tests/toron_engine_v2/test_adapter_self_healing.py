"""
Tests for CloudProviderAdapter self-healing + failover.
"""

import asyncio

from src.backend.core.toron.engine_v2.core.cloud_provider_adapter import (
    CloudProviderAdapter,
)
from src.backend.core.toron.engine_v2.core.health_monitor import HealthMonitor


class DummyConfig:
    model_timeout_seconds = 2
    provider_priority = ["openai", "aws-bedrock"]


class FailingConnector:
    """Always fails to simulate a dead provider."""

    async def infer(self, messages, model):
        raise Exception("simulated connector failure")

    async def list_models(self):
        return []

    async def health_check(self):
        return False


class SuccessConnector:
    """Always succeeds quickly."""

    async def infer(self, messages, model):
        return {"content": "ok"}, {"provider": "aws-bedrock", "model": model}

    async def list_models(self):
        return [{"model_id": "test-model", "provider": "aws-bedrock"}]

    async def health_check(self):
        return True


def test_adapter_failover_and_mark_failure():
    connectors = {
        "openai": FailingConnector(),
        "aws-bedrock": SuccessConnector(),
    }
    hm = HealthMonitor(list(connectors.keys()), failure_threshold=1, cooldown_seconds=60)
    adapter = CloudProviderAdapter(connectors, DummyConfig(), health_monitor=hm)

    resp, meta = asyncio.run(
        adapter.dispatch(
            messages=[{"role": "user", "content": "hello"}],
            model="test-model",
        )
    )

    # Should have skipped failing openai and used aws-bedrock
    assert resp["content"] == "ok"
    assert meta["provider"] == "aws-bedrock"

    snap = hm.snapshot()
    assert snap["openai"]["failures"] >= 1
    assert snap["openai"]["healthy"] is False  # tripped circuit
