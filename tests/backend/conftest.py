from __future__ import annotations

import os
from collections import defaultdict
from typing import Any, Dict

import pytest

from backend import create_app


class InMemoryRedis:
    """A lightweight Redis stand-in for tests."""

    def __init__(self) -> None:
        self._store: Dict[str, Any] = {}
        self._lists: Dict[str, list[str]] = defaultdict(list)

    def get(self, key: str) -> Any:
        return self._store.get(key)

    def setex(self, key: str, ttl: int, value: Any) -> None:  # noqa: ARG002
        self._store[key] = value

    def lpush(self, key: str, value: str) -> None:
        self._lists[key].insert(0, value)
        self._store[key] = self._lists[key]

    def expire(self, key: str, ttl: int) -> None:  # noqa: ARG002
        # TTL is ignored in-memory but method exists for compatibility.
        return None

    def incr(self, key: str) -> int:
        value = int(self._store.get(key, 0)) + 1
        self._store[key] = value
        return value

    def flushall(self) -> None:
        self._store.clear()
        self._lists.clear()


@pytest.fixture()
def redis_client() -> InMemoryRedis:
    client = InMemoryRedis()
    yield client
    client.flushall()


@pytest.fixture()
def app(tmp_path, redis_client: InMemoryRedis):
    os.environ["TELEMETRY_DB_PATH"] = str(tmp_path / "telemetry.db")
    os.environ["BETA_UNLIMITED"] = "true"
    application = create_app(
        redis_client=redis_client,
        llm_clients=None,
        limiter_storage_uri="memory://",
    )
    application.config.update(TESTING=True)
    yield application


@pytest.fixture()
def client(app):
    return app.test_client()
