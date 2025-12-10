"""Model Assurance Layer utilities used by the CI test suite."""

from __future__ import annotations

import re
from hashlib import sha256
from typing import Callable, Dict, Generic, TypeVar

T = TypeVar("T")


class DeterministicCache(Generic[T]):
    """Re-exported cache for MAL-specific computations."""

    def __init__(self) -> None:
        self._store: Dict[str, T] = {}

    def get_or_create(self, key: str, factory: Callable[[], T]) -> T:
        if key not in self._store:
            self._store[key] = factory()
        return self._store[key]

    def __len__(self) -> int:  # pragma: no cover - simple accessor
        return len(self._store)


class TokenEstimator:
    """Deterministic token counting for offline validation."""

    def count(self, text: str) -> int:
        tokens = re.findall(r"\b\w+\b", text)
        return len(tokens)


class ModelAssuranceLayer:
    """Offline MAL that provides deterministic latencies and fingerprints."""

    def __init__(self) -> None:
        self._latency_cache: DeterministicCache[int] = DeterministicCache()
        self._fingerprint_cache: DeterministicCache[str] = DeterministicCache()
        self.token_estimator = TokenEstimator()
        self.api_calls = 0

    def generate_latency(self, signature: str) -> int:
        def _factory() -> int:
            digest = sha256(signature.encode()).digest()
            return 50 + (digest[1] % 40)

        latency = self._latency_cache.get_or_create(signature, _factory)
        return int(latency)

    def fingerprint(self, payload: str) -> str:
        def _factory() -> str:
            return sha256(payload.encode()).hexdigest()

        return str(self._fingerprint_cache.get_or_create(payload, _factory))

    def cached_latencies(self) -> int:
        return len(self._latency_cache)

    def cached_fingerprints(self) -> int:
        return len(self._fingerprint_cache)

    def token_count(self, text: str) -> int:
        return self.token_estimator.count(text)

    def record_api_call(self) -> None:
        self.api_calls += 1
