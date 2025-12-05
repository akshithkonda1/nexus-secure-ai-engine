"""Cache invalidation utilities for Toron multi-layer cache."""

from typing import Iterable

from redis import asyncio as aioredis

from .multi_layer_cache import MultiLayerCache
from .cache_config import CacheConfig


class CacheInvalidator:
    def __init__(self, cache: MultiLayerCache | None = None, config: CacheConfig | None = None):
        self.config = config or CacheConfig()
        self.cache = cache or MultiLayerCache(self.config)
        self.redis = self.cache.redis if cache else aioredis.from_url(self.config.redis_url, encoding="utf-8", decode_responses=True)

    async def invalidate_user(self, user_id: str):
        prefix = f"toron:cache:user:{user_id}"
        await self._invalidate_prefix(prefix)

    async def invalidate_model(self, model: str):
        prefix = f"toron:cache:model:{model}"
        await self._invalidate_prefix(prefix)

    async def invalidate_prefix(self, prefix: str):
        await self._invalidate_prefix(prefix)

    async def invalidate_stale(self):
        async for key in self.redis.scan_iter(match="toron:cache:*"):
            ttl = await self.redis.ttl(key)
            if ttl == -2:
                continue
            if ttl == -1 or ttl <= 0:
                await self.redis.delete(key)
                await self.cache.l1.invalidate_prefix(key)

    async def _invalidate_prefix(self, prefix: str):
        async for key in self.redis.scan_iter(match=f"{prefix}*"):
            await self.redis.delete(key)
        await self.cache.l1.invalidate_prefix(prefix)

    async def bulk_delete(self, keys: Iterable[str]):
        if not keys:
            return
        await self.redis.delete(*keys)
        for key in keys:
            await self.cache.l1.invalidate_prefix(key)
