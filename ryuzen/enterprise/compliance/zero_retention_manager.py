"""Zero-retention manager wrapper."""
from __future__ import annotations

import importlib
import logging

_zero_retention_spec = importlib.util.find_spec("enterprise.compliance.zero_retention_manager")
_ZeroRetentionManager = None
if _zero_retention_spec:
    _ZeroRetentionManager = importlib.import_module("enterprise.compliance.zero_retention_manager").ZeroRetentionManager

logger = logging.getLogger(__name__)


class ZeroRetentionManager:
    def __init__(self):
        self._impl = _ZeroRetentionManager() if _ZeroRetentionManager else None
        self.ephemeral_store: dict[str, float] = {}

    def register(self, resource_id: str, ttl_seconds: int) -> None:
        if self._impl:
            return self._impl.register(resource_id, ttl_seconds)
        import time

        self.ephemeral_store[resource_id] = time.time() + ttl_seconds

    def purge_expired(self) -> None:
        if self._impl:
            return self._impl.purge_expired()
        import time

        now = time.time()
        for key, expiry in list(self.ephemeral_store.items()):
            if expiry < now:
                self.ephemeral_store.pop(key, None)

    def is_allowed(self, resource_id: str) -> bool:
        if self._impl:
            return self._impl.is_allowed(resource_id)
        self.purge_expired()
        return resource_id not in self.ephemeral_store
