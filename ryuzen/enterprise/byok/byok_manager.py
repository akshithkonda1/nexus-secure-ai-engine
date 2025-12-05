"""Bring-your-own-key manager with optional secure backends."""
from __future__ import annotations

import importlib
import logging
from typing import Dict, Optional

_dbk_spec = importlib.util.find_spec("enterprise.encryption.device_bound_keys")
DeviceBoundKeyManager = None
if _dbk_spec:
    DeviceBoundKeyManager = importlib.import_module("enterprise.encryption.device_bound_keys").DeviceBoundKeyManager

logger = logging.getLogger(__name__)


class BYOKManager:
    def __init__(self):
        self._impl = DeviceBoundKeyManager() if DeviceBoundKeyManager else None
        self._in_memory_keys: Dict[str, str] = {}

    def provision_key(self, tenant_id: str, key_material: Optional[str] = None) -> str:
        if self._impl:
            return self._impl.create_key(tenant_id, key_material)
        material = key_material or f"key-{tenant_id}"
        self._in_memory_keys[tenant_id] = material
        logger.debug("Provisioned in-memory key for %s", tenant_id)
        return material

    def get_key(self, tenant_id: str) -> Optional[str]:
        if self._impl:
            try:
                return self._impl.get_key(tenant_id)
            except Exception:
                logger.exception("Failed to fetch key from BYOK backend")
        return self._in_memory_keys.get(tenant_id)

    def revoke_key(self, tenant_id: str) -> None:
        if self._impl:
            try:
                return self._impl.revoke_key(tenant_id)
            except Exception:
                logger.exception("Failed to revoke BYOK key")
        self._in_memory_keys.pop(tenant_id, None)
