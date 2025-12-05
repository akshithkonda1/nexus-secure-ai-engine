"""Multi-layer cache implementation with L1/L2/L3 tiers."""

import asyncio
import json
import time
import hashlib
from collections import OrderedDict
from typing import Optional, Tuple

import aioboto3
from redis import asyncio as aioredis

from ...api.encryption import ToronEncryptor
from .cache_config import CacheConfig
from .cache_metrics import CacheMetrics


class _LRUCache:
    def __init__(self, max_size: int):
        self.max_size = max_size
        self._store: OrderedDict[str, Tuple[dict, float]] = OrderedDict()
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[dict]:
        async with self._lock:
            if key not in self._store:
                return None
            value, expires_at = self._store[key]
            if expires_at and expires_at < time.time():
                self._store.pop(key, None)
                return None
            self._store.move_to_end(key)
            return value

    async def set(self, key: str, value: dict, ttl: int):
        async with self._lock:
            expires_at = time.time() + ttl if ttl else None
            self._store[key] = (value, expires_at)
            self._store.move_to_end(key)
            await self._evict_if_needed()

    async def invalidate_prefix(self, prefix: str):
        async with self._lock:
            for k in list(self._store.keys()):
                if k.startswith(prefix):
                    self._store.pop(k, None)

    async def _evict_if_needed(self):
        while len(self._store) > self.max_size:
            self._store.popitem(last=False)

    async def stats(self):
        async with self._lock:
            return {"size": len(self._store), "capacity": self.max_size}

    def snapshot(self) -> dict:
        return {"size": len(self._store), "capacity": self.max_size}


class MultiLayerCache:
    def __init__(self, config: CacheConfig | None = None, redis_client=None, boto_session=None):
        self.config = config or CacheConfig()
        self.metrics = CacheMetrics()
        self.encryptor = ToronEncryptor()
        self.l1 = _LRUCache(self.config.l1_max_size)
        self.redis = redis_client or aioredis.from_url(self.config.redis_url, encoding="utf-8", decode_responses=True)
        self.boto_session = boto_session or aioboto3.Session()

    def _make_key(self, request_dict: dict) -> str:
        serialized = json.dumps(request_dict, sort_keys=True, separators=(",", ":"))
        digest = hashlib.sha256(serialized.encode()).hexdigest()
        return f"toron:cache:{digest}"

    async def get(self, request_dict) -> Optional[dict]:
        key = self._make_key(request_dict)

        l1_value = await self.l1.get(key)
        if l1_value is not None:
            self.metrics.record_hit("l1")
            return l1_value

        blob = await self.redis.get(key)
        if blob:
            try:
                decrypted = self.encryptor.decrypt(blob, key)
                self.metrics.record_hit("l2")
                await self.l1.set(key, decrypted, self.config.cold_storage_ttl_threshold)
                self.metrics.record_promotion("l2", "l1")
                return decrypted
            except Exception:
                await self.redis.delete(key)

        s3_value = await self._get_from_s3(key)
        if s3_value is not None:
            self.metrics.record_hit("l3")
            await self.redis.set(key, self.encryptor.encrypt(s3_value, key), ex=self.config.cold_storage_ttl_threshold)
            self.metrics.record_promotion("l3", "l2")
            await self.l1.set(key, s3_value, self.config.cold_storage_ttl_threshold)
            self.metrics.record_promotion("l2", "l1")
            return s3_value

        self.metrics.record_miss()
        return None

    async def set(self, request_dict, value: dict, ttl: int = 3600):
        key = self._make_key(request_dict)
        ttl = self.config.clamp_ttl(ttl)

        await self.l1.set(key, value, ttl)

        payload = self.encryptor.encrypt(value, key)
        await self.redis.set(key, payload, ex=ttl)

        serialized = json.dumps(value, separators=(",", ":")).encode()
        if len(serialized) >= self.config.cold_storage_threshold_bytes or ttl >= self.config.cold_storage_ttl_threshold:
            await self._put_to_s3(key, serialized, ttl)

    def stats(self) -> dict:
        snapshot = self.metrics.snapshot()
        snapshot.update({"l1": self.l1.snapshot()})
        return snapshot

    async def warm(self, items: list):
        tasks = [self.set(req, val, ttl=item.get("ttl", 3600)) for item in items for req, val in [(item.get("request"), item.get("value"))]]
        if tasks:
            await asyncio.gather(*tasks)

    async def _get_from_s3(self, key: str) -> Optional[dict]:
        async with self.boto_session.client("s3") as client:
            try:
                obj = await client.get_object(Bucket=self.config.s3_bucket, Key=f"{self.config.s3_prefix}{key}")
                body = await obj["Body"].read()
                decrypted = self.encryptor.decrypt(body.decode(), key)
                return decrypted
            except client.exceptions.NoSuchKey:
                return None
            except Exception:
                return None

    async def _put_to_s3(self, key: str, payload: bytes, ttl: int):
        expires = int(time.time() + ttl)
        async with self.boto_session.client("s3") as client:
            blob = self.encryptor.encrypt(json.loads(payload.decode()), key)
            await client.put_object(
                Bucket=self.config.s3_bucket,
                Key=f"{self.config.s3_prefix}{key}",
                Body=blob.encode(),
                Expires=expires,
            )
