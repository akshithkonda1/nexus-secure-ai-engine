"""Simple in-memory cache with eviction metrics used by the Ryuzen backend."""
from __future__ import annotations

import time
from typing import Any, Dict, Optional, Tuple


class InMemoryCache:
    def __init__(self, max_size: int = 10000):
        self._store: Dict[str, Tuple[Any, float | None]] = {}
        self._max_size = max_size
        self._eviction_stats = {
            "ttl_evictions": 0,
            "size_evictions": 0,
            "manual_deletions": 0,
        }

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        # Evict if at max capacity
        if len(self._store) >= self._max_size and key not in self._store:
            self._evict_oldest()

        expiry = time.time() + ttl_seconds if ttl_seconds else None
        self._store[key] = (value, expiry)

    def get(self, key: str) -> Any:
        value, expiry = self._store.get(key, (None, None))
        if expiry and expiry < time.time():
            self._store.pop(key, None)
            self._eviction_stats["ttl_evictions"] += 1
            return None
        return value

    def delete(self, key: str) -> None:
        if key in self._store:
            self._eviction_stats["manual_deletions"] += 1
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()

    def _evict_oldest(self) -> None:
        """Evict the oldest entry (first inserted) when cache is full."""
        if self._store:
            oldest_key = next(iter(self._store))
            self._store.pop(oldest_key, None)
            self._eviction_stats["size_evictions"] += 1

    def cleanup_expired(self) -> int:
        """Remove all expired entries. Returns count of removed entries."""
        now = time.time()
        expired_keys = [
            key for key, (_, expiry) in self._store.items()
            if expiry and expiry < now
        ]
        for key in expired_keys:
            self._store.pop(key, None)
            self._eviction_stats["ttl_evictions"] += 1
        return len(expired_keys)

    def get_eviction_stats(self) -> Dict[str, int]:
        """Return eviction statistics."""
        return {
            **self._eviction_stats,
            "current_size": len(self._store),
            "max_size": self._max_size,
        }
