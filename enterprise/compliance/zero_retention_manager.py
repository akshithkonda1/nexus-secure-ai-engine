"""
Zero retention manager ensuring ephemeral handling of sensitive data.
"""
from __future__ import annotations

import time
from typing import Dict


class ZeroRetentionManager:
    def __init__(self):
        self.ephemeral_store: Dict[str, float] = {}

    def register(self, resource_id: str, ttl_seconds: int) -> None:
        self.ephemeral_store[resource_id] = time.time() + ttl_seconds

    def purge_expired(self) -> None:
        now = time.time()
        expired = [k for k, v in self.ephemeral_store.items() if v < now]
        for key in expired:
            self.ephemeral_store.pop(key, None)

    def is_allowed(self, resource_id: str) -> bool:
        self.purge_expired()
        return resource_id not in self.ephemeral_store
