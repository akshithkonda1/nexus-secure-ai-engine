"""Key management for AES-256-GCM with in-memory rotation."""
from __future__ import annotations

import os
import secrets
import uuid
from typing import Dict, Optional, Tuple

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

from ..utils.ErrorTypes import SecurityError
from .SecureMemory import wipe_buffer


class KeyManager:
    def __init__(self) -> None:
        self._keys: Dict[str, bytes] = {}
        self._active_key_id: Optional[str] = None
        self._kek = os.urandom(32)
        self.generate_key()

    @property
    def active_key_id(self) -> str:
        assert self._active_key_id, "No active key configured"
        return self._active_key_id

    def generate_key(self) -> Tuple[str, bytes]:
        key_id = uuid.uuid4().hex
        key = secrets.token_bytes(32)
        self._keys[key_id] = key
        self._active_key_id = key_id
        return key_id, key

    def rotate_key(self) -> Tuple[str, bytes]:
        return self.generate_key()

    def _derive(self, label: str, context: str) -> bytes:
        if not self._active_key_id:
            raise SecurityError("Active key missing")
        base_key = self._keys[self._active_key_id]
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=label.encode("utf-8"),
            info=context.encode("utf-8"),
        )
        derived = hkdf.derive(base_key)
        return derived

    def derive_region_key(self, region: str) -> bytes:
        return self._derive("region", region or "unknown")

    def derive_tenant_key(self, tenant: str) -> bytes:
        return self._derive("tenant", tenant or "anon")

    def seal_key(self, key: bytes) -> Dict[str, str]:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        nonce = os.urandom(12)
        aesgcm = AESGCM(self._kek)
        sealed = aesgcm.encrypt(nonce, key, b"key-seal")
        return {"nonce": nonce.hex(), "blob": sealed.hex()}

    def unseal_key(self, sealed: Dict[str, str]) -> bytes:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        nonce = bytes.fromhex(sealed["nonce"])
        blob = bytes.fromhex(sealed["blob"])
        aesgcm = AESGCM(self._kek)
        unsealed = aesgcm.decrypt(nonce, blob, b"key-seal")
        return unsealed

    def get_active_key(self) -> bytes:
        if not self._active_key_id:
            raise SecurityError("No active key configured")
        return self._keys[self._active_key_id]

    def get_key(self, key_id: str) -> bytes:
        if key_id not in self._keys:
            raise SecurityError("Key not found")
        return self._keys[key_id]

    def shred(self) -> None:
        for key_id, key in list(self._keys.items()):
            mutable = bytearray(key)
            wipe_buffer(mutable)
            self._keys[key_id] = b""
        self._keys.clear()
        wipe_buffer(bytearray(self._kek))
        self._kek = b""
        self._active_key_id = None


__all__ = ["KeyManager"]
