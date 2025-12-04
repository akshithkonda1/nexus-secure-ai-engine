import asyncio
from dataclasses import dataclass
from typing import Any, Callable, Optional
from unittest.mock import AsyncMock

import pytest


class ToronConnectorError(Exception):
    def __init__(self, message: str, category: str = "provider", cause: Optional[BaseException] = None):
        super().__init__(message)
        self.message = message
        self.category = category
        self.cause = cause

    def to_dict(self) -> dict[str, Any]:
        return {
            "message": self.message,
            "category": self.category,
            "cause": repr(self.cause) if self.cause else None,
        }


class CircuitBreaker:
    def __init__(self, threshold: int = 3):
        self.threshold = threshold
        self.failures = 0
        self.state = "closed"

    def allow_request(self) -> bool:
        return self.state == "closed"

    def record_success(self) -> None:
        self.failures = 0
        self.state = "closed"

    def record_failure(self) -> None:
        self.failures += 1
        if self.failures >= self.threshold:
            self.state = "open"


@dataclass
class MockConnector:
    provider: Callable[[dict[str, Any]], Any]
    timeout: float = 0.1
    retries: int = 0
    breaker: Optional[CircuitBreaker] = None

    async def send(self, payload: dict[str, Any]) -> Any:
        if self.breaker and not self.breaker.allow_request():
            raise ToronConnectorError("circuit-open", category="circuit")

        last_error: Optional[ToronConnectorError] = None
        attempts = self.retries + 1
        for _ in range(attempts):
            try:
                result = await asyncio.wait_for(self.provider(payload), timeout=self.timeout)
                if self.breaker:
                    self.breaker.record_success()
                return result
            except asyncio.TimeoutError as exc:
                last_error = ToronConnectorError("timeout", category="timeout", cause=exc)
            except Exception as exc:  # pragma: no cover - generic safety net
                last_error = ToronConnectorError("provider-error", category="provider", cause=exc)

            if self.breaker:
                self.breaker.record_failure()
            await asyncio.sleep(0)  # yield to loop for determinism

        assert last_error is not None  # for type checking
        raise last_error


@pytest.mark.asyncio
async def test_mocked_async_provider_call_success():
    provider = AsyncMock(return_value={"ok": True})
    connector = MockConnector(provider=provider, timeout=0.2)

    result = await connector.send({"prompt": "hello"})

    provider.assert_awaited_once()
    assert result == {"ok": True}


@pytest.mark.asyncio
async def test_timeout_behavior():
    async def slow_provider(_: dict[str, Any]) -> None:
        await asyncio.sleep(0.2)
        return None

    connector = MockConnector(provider=slow_provider, timeout=0.05)

    with pytest.raises(ToronConnectorError) as excinfo:
        await connector.send({})

    assert excinfo.value.category == "timeout"
    assert isinstance(excinfo.value.cause, asyncio.TimeoutError)


@pytest.mark.asyncio
async def test_retries_on_failure():
    provider = AsyncMock(side_effect=[asyncio.TimeoutError(), {"attempt": 2}])
    connector = MockConnector(provider=provider, timeout=0.05, retries=1)

    result = await connector.send({})

    assert result == {"attempt": 2}
    assert provider.await_count == 2


@pytest.mark.asyncio
async def test_circuit_breaker_activation():
    provider = AsyncMock(side_effect=RuntimeError("boom"))
    breaker = CircuitBreaker(threshold=2)
    connector = MockConnector(provider=provider, retries=1, breaker=breaker, timeout=0.05)

    with pytest.raises(ToronConnectorError):
        await connector.send({})

    assert breaker.state == "open"
    assert breaker.failures == 2

    with pytest.raises(ToronConnectorError) as excinfo:
        await connector.send({})

    assert excinfo.value.category == "circuit"


@pytest.mark.asyncio
async def test_structured_error_wrapping():
    provider = AsyncMock(side_effect=ValueError("bad"))
    breaker = CircuitBreaker(threshold=1)
    connector = MockConnector(provider=provider, retries=0, breaker=breaker, timeout=0.05)

    with pytest.raises(ToronConnectorError) as excinfo:
        await connector.send({"prompt": "data"})

    payload = excinfo.value.to_dict()
    assert payload["category"] == "provider"
    assert "ValueError" in payload["cause"]
    assert not breaker.allow_request()
