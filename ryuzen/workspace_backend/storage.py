"""Minimal in-memory storage for workspace data."""
from __future__ import annotations

import threading
from typing import Any, Dict, Iterable, Optional


class InMemoryStore:
    def __init__(self):
        self._lock = threading.Lock()
        self._store: Dict[str, Dict[str, Any]] = {}

    def set(self, namespace: str, key: str, value: Any) -> None:
        with self._lock:
            self._store.setdefault(namespace, {})[key] = value

    def get(self, namespace: str, key: str, default: Any = None) -> Any:
        with self._lock:
            return self._store.get(namespace, {}).get(key, default)

    def delete(self, namespace: str, key: str) -> None:
        with self._lock:
            self._store.get(namespace, {}).pop(key, None)

    def list_keys(self, namespace: str) -> Iterable[str]:
        with self._lock:
            return list(self._store.get(namespace, {}).keys())

    def list_items(self, namespace: str) -> Dict[str, Any]:
        with self._lock:
            return dict(self._store.get(namespace, {}))
