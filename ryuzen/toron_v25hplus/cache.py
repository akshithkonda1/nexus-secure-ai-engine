"""Concurrency-safe stale-while-revalidate cache utilities."""

from __future__ import annotations

import asyncio
import time
from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Dict, Generic, Optional, TypeVar


T = TypeVar("T")


@dataclass
class CacheEntry(Generic[T]):
    value: Optional[T]
    expires_at: float
    last_refresh: float


class TelemetryCounter:
    """Simple telemetry collector for cache operations."""

    def __init__(self) -> None:
        self.counters: Dict[str, int] = defaultdict(int)

    def increment(self, key: str) -> None:
        self.counters[key] += 1

    def snapshot(self) -> Dict[str, int]:  # pragma: no cover - trivial access
        return dict(self.counters)


class StaleWhileRevalidateCache(Generic[T]):
    """Serve stale data immediately and refresh asynchronously.

    The cache is designed to prevent stampedes by protecting each key with an
    ``asyncio.Lock``. Only one refresher coroutine will run per key while other
    callers receive the previous value. The cache still returns ``None`` if no
    value has ever been set for the key.
    """

    def __init__(self, ttl_seconds: float = 60.0) -> None:
        self.ttl_seconds = float(ttl_seconds)
        self._entries: Dict[str, CacheEntry[T]] = {}
        self._locks: Dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)
        self.telemetry = TelemetryCounter()

    async def get_or_refresh(
        self, key: str, factory: Callable[[], Awaitable[T]]
    ) -> Optional[T]:
        now = time.time()
        entry = self._entries.get(key)
        if entry and entry.expires_at > now:
            self.telemetry.increment("hit")
            return entry.value

        if entry and entry.value is not None:
            self.telemetry.increment("stale_hit")
            asyncio.create_task(self._refresh(key, factory))
            return entry.value

        self.telemetry.increment("miss")
        async with self._locks[key]:
            # Double check after acquiring lock.
            entry = self._entries.get(key)
            if entry and entry.expires_at > time.time():
                self.telemetry.increment("hit_after_lock")
                return entry.value
            value = await factory()
            self._entries[key] = CacheEntry(
                value=value, expires_at=time.time() + self.ttl_seconds, last_refresh=time.time()
            )
            return value

    async def _refresh(self, key: str, factory: Callable[[], Awaitable[T]]) -> None:
        async with self._locks[key]:
            try:
                value = await factory()
                self._entries[key] = CacheEntry(
                    value=value, expires_at=time.time() + self.ttl_seconds, last_refresh=time.time()
                )
                self.telemetry.increment("revalidated")
            except Exception:
                # We never swallow failures silently; propagate by recording telemetry.
                self.telemetry.increment("revalidate_failed")

