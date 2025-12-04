from __future__ import annotations

import asyncio

import pytest


pytestmark = pytest.mark.chaos


class BrokenRedis:
    async def get(self, _: str):
        await asyncio.sleep(0)
        raise ConnectionError("redis down")

    async def set(self, key: str, value: str):
        await asyncio.sleep(0)
        raise ConnectionError("redis down")


class ResilientEngine:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def respond(self, prompt: str) -> str:
        try:
            cached = await self.redis.get(prompt)
        except Exception:
            cached = None

        if cached:
            return cached

        result = f"answer:{prompt}"
        try:
            await self.redis.set(prompt, result)
        except Exception:
            pass
        return result


@pytest.mark.asyncio
async def test_engine_bypasses_cache_on_outage():
    engine = ResilientEngine(redis_client=BrokenRedis())
    response = await engine.respond("ping")
    assert response == "answer:ping"
