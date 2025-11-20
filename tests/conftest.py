"""Reusable fixtures for Toron engine unit tests."""

import pytest

from toron.cloud_adapter import CloudProviderAdapter
from toron.connectors import ConnectorRegistry
from toron.crypto import generate_key
from toron.pii import PIIPipeline
from toron.rate_limit import TokenBucket


@pytest.fixture()
def crypto_key() -> bytes:
    """Provide a fresh AES-256 key for each test."""

    return generate_key()


@pytest.fixture()
def pii_pipeline() -> PIIPipeline:
    """PII pipeline with deterministic token for assertions."""

    return PIIPipeline(redaction_token="[REDACTED]")


@pytest.fixture()
def connector_registry() -> ConnectorRegistry:
    """Default registry with three cloud providers."""

    return ConnectorRegistry.default()


@pytest.fixture()
def cloud_adapter() -> CloudProviderAdapter:
    """Adapter populated with default endpoints."""

    return CloudProviderAdapter()


@pytest.fixture()
def fake_clock():
    """A monotonic clock stub that can be advanced in tests."""

    class Clock:
        def __init__(self) -> None:
            self._now = 0.0

        def __call__(self) -> float:
            return self._now

        def advance(self, seconds: float) -> None:
            self._now += seconds

    return Clock()


@pytest.fixture()
def rate_limiter(fake_clock) -> TokenBucket:
    """Token bucket seeded with a fake clock for deterministic behaviour."""

    return TokenBucket(capacity=5, fill_rate=1, time_provider=fake_clock)


class _FakeResponse:
    def __init__(self, payload, status_code: int = 200):
        self.payload = payload
        self.status_code = status_code
        self.text = payload if isinstance(payload, str) else "payload"

    def json(self):
        if isinstance(self.payload, dict):
            return self.payload
        raise ValueError("Payload is not JSON serialisable")


class FakeSession:
    """Test double for an HTTP session."""

    def __init__(self, payload, status_code: int = 200):
        self._payload = payload
        self._status_code = status_code

    def get(self, url: str, timeout: int = 5):  # pragma: no cover - simple wrapper
        return _FakeResponse(self._payload, self._status_code)


@pytest.fixture()
def fake_session():
    """Return a fake HTTP session serving deterministic payloads."""

    return FakeSession({"message": "ok"})
