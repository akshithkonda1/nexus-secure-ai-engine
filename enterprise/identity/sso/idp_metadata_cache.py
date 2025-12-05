"""
In-memory IdP metadata cache with freshness control.
"""
from __future__ import annotations

import time
from typing import Dict, Optional


class IdPMetadataCache:
    def __init__(self, ttl: int = 3600):
        self.ttl = ttl
        self._cache: Dict[str, tuple[float, dict]] = {}

    def set(self, idp_entity_id: str, metadata: dict) -> None:
        self._cache[idp_entity_id] = (time.time(), metadata)

    def get(self, idp_entity_id: str) -> Optional[dict]:
        entry = self._cache.get(idp_entity_id)
        if not entry:
            return None
        created, metadata = entry
        if time.time() - created > self.ttl:
            self._cache.pop(idp_entity_id, None)
            return None
        return metadata

    def refresh_needed(self, idp_entity_id: str) -> bool:
        entry = self._cache.get(idp_entity_id)
        return not entry or (time.time() - entry[0] > (self.ttl * 0.8))
