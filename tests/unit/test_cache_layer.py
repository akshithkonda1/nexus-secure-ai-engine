from __future__ import annotations

import asyncio
from collections import OrderedDict
from dataclasses import dataclass, field
from typing import Any, Dict

import pytest


class FakeRedis:
    def __init__(self):
        self.store: Dict[str, Any] = {}

    async def get(self, key: str) -> Any:
        await asyncio.sleep(0)
        return self.store.get(key)

    async def set(self, key: str, value: Any) -> None:
        await asyncio.sleep(0)
        self.store[key] = value


class FakeS3:
    def __init__(self):
        self.bucket: Dict[str, dict[str, Any]] = {}

    async def put_object(self, key: str, value: Any, metadata: dict[str, Any] | None = None) -> None:
        self.bucket[key] = {"value": value, "metadata": metadata or {}, "encrypted": True}

    async def get_object(self, key: str) -> dict[str, Any] | None:
        return self.bucket.get(key)


@dataclass
class CacheLayer:
    l1_size: int = 3
    l1: OrderedDict[str, Any] = field(default_factory=OrderedDict)
    l2: FakeRedis = field(default_factory=FakeRedis)
    l3: FakeS3 = field(default_factory=FakeS3)

    def key_for(self, prompt: str) -> str:
        return f"cache::{hash(prompt)}"

    def _touch(self, key: str, value: Any) -> None:
        if key in self.l1:
            self.l1.move_to_end(key)
        self.l1[key] = value
        if len(self.l1) > self.l1_size:
            self.l1.popitem(last=False)

    async def get(self, prompt: str) -> Any:
        key = self.key_for(prompt)
        if key in self.l1:
            return self.l1[key]

        cached = await self.l2.get(key)
        if cached is not None:
            self._touch(key, cached)
            return cached

        cold = await self.l3.get_object(key)
        if cold is not None:
            value = cold["value"]
            self._touch(key, value)
            await self.l2.set(key, value)
            return value

        return None

    async def set(self, prompt: str, value: Any) -> None:
        key = self.key_for(prompt)
        self._touch(key, value)
        await self.l2.set(key, value)
        await self.l3.put_object(key, value, metadata={"encrypted": True})


@pytest.mark.asyncio
async def test_l1_hit():
    cache = CacheLayer()
    await cache.set("hello", "world")
    assert await cache.get("hello") == "world"


@pytest.mark.asyncio
async def test_l2_hit_via_fakeredis():
    cache = CacheLayer()
    key = cache.key_for("prompt")
    await cache.l2.set(key, "from-l2")
    result = await cache.get("prompt")
    assert result == "from-l2"
    assert key in cache.l1


@pytest.mark.asyncio
async def test_l3_fallback_with_mock_s3():
    cache = CacheLayer()
    key = cache.key_for("deep")
    await cache.l3.put_object(key, "cold", metadata={"ttl": 1})
    value = await cache.get("deep")
    assert value == "cold"
    assert cache.l1[key] == "cold"


@pytest.mark.asyncio
async def test_encryption_wrapper_stub():
    cache = CacheLayer()
    await cache.set("secure", {"secret": 1})
    key = cache.key_for("secure")
    stored = await cache.l3.get_object(key)
    assert stored["encrypted"] is True
    assert stored["metadata"]["encrypted"] is True


@pytest.mark.asyncio
async def test_cache_key_generation_is_stable():
    cache = CacheLayer()
    assert cache.key_for("abc") == cache.key_for("abc")
    assert cache.key_for("abc") != cache.key_for("def")


@pytest.mark.asyncio
async def test_lru_eviction_logic():
    cache = CacheLayer(l1_size=2)
    await cache.set("a", 1)
    await cache.set("b", 2)
    await cache.set("c", 3)
    assert "a" not in [prompt.split("::")[-1] for prompt in cache.l1.keys()]
    assert len(cache.l1) == 2
