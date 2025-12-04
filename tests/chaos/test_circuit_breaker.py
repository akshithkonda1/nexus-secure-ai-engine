from __future__ import annotations

import pytest


pytestmark = pytest.mark.chaos


class CircuitBreaker:
    def __init__(self, threshold: int = 5):
        self.threshold = threshold
        self.failures = 0
        self.state = "closed"

    def record_failure(self):
        self.failures += 1
        if self.failures >= self.threshold:
            self.state = "open"

    def allow(self) -> bool:
        return self.state == "closed"


class ProviderCaller:
    def __init__(self, breaker: CircuitBreaker):
        self.breaker = breaker

    def call(self) -> str:
        if not self.breaker.allow():
            return "fast-fail"
        self.breaker.record_failure()
        raise RuntimeError("provider failure")


def test_circuit_breaker_opens_after_failures():
    breaker = CircuitBreaker(threshold=5)
    caller = ProviderCaller(breaker)

    for _ in range(5):
        try:
            caller.call()
        except RuntimeError:
            pass

    assert breaker.state == "open"
    assert caller.call() == "fast-fail"
