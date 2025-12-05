"""Simple in-memory cache used by the Ryuzen backend."""
from __future__ import annotations

import time
from typing import Any, Dict, Optional, Tuple


class InMemoryCache:
    def __init__(self):
        self._store: Dict[str, Tuple[Any, float | None]] = {}

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        expiry = time.time() + ttl_seconds if ttl_seconds else None
        self._store[key] = (value, expiry)

    def get(self, key: str) -> Any:
        value, expiry = self._store.get(key, (None, None))
        if expiry and expiry < time.time():
            self._store.pop(key, None)
            return None
        return value

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()
