"""AES-256-GCM encryption with key rotation and tamper detection."""
from __future__ import annotations

import json
import os
from typing import Any, Dict, Optional, Union

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from ..utils.ErrorTypes import SecurityError
from ..utils.JSONSafe import safe_serialize
from .KeyManager import KeyManager
from .SecureMemory import secure_memory, wipe_buffer


class CrypterAES256:
    def __init__(self, key_manager: Optional[KeyManager] = None) -> None:
        self.key_manager = key_manager or KeyManager()

    def _aad_from_metadata(self, metadata: Optional[Dict[str, Any]]) -> bytes:
        metadata = metadata or {}
        tenant = metadata.get("tenant_id", "")
        region = metadata.get("region", "")
        user = metadata.get("user_id", "")
        aad = f"tenant:{tenant}|region:{region}|user:{user}".encode("utf-8")
        return aad

    def encrypt(self, data: Union[Dict[str, Any], str], metadata: Optional[Dict[str, Any]] = None) -> bytes:
        key = self.key_manager.get_active_key()
        aad = self._aad_from_metadata(metadata)
        nonce = os.urandom(12)
        aesgcm = AESGCM(key)

        if isinstance(data, dict):
            plaintext = safe_serialize(data).encode("utf-8")
        else:
            plaintext = str(data).encode("utf-8")

        with secure_memory(len(plaintext)) as buf:
            buf[: len(plaintext)] = plaintext
            ciphertext = aesgcm.encrypt(nonce, bytes(buf[: len(plaintext)]), aad)
            wipe_buffer(buf)

        payload = {
            "kid": self.key_manager.active_key_id,
            "nonce": nonce.hex(),
            "ciphertext": ciphertext.hex(),
        }
        serialized = json.dumps(payload).encode("utf-8")
        wipe_buffer(bytearray(plaintext))
        return serialized

    def decrypt_ephemeral(self, encrypted_bytes: bytes, metadata: Optional[Dict[str, Any]] = None) -> str:
        try:
            payload = json.loads(encrypted_bytes.decode("utf-8"))
            key_id = payload["kid"]
            nonce = bytes.fromhex(payload["nonce"])
            ciphertext = bytes.fromhex(payload["ciphertext"])
        except Exception as exc:  # pragma: no cover - defensive
            raise SecurityError("Malformed encrypted payload") from exc

        key = self.key_manager.get_key(key_id)
        aesgcm = AESGCM(key)
        aad = self._aad_from_metadata(metadata)

        with secure_memory(len(ciphertext)) as buf:
            buf[: len(ciphertext)] = ciphertext
            try:
                plaintext = aesgcm.decrypt(nonce, bytes(buf[: len(ciphertext)]), aad)
            except Exception as exc:  # pragma: no cover - tamper detection
                raise SecurityError("Integrity check failed") from exc
            finally:
                wipe_buffer(buf)
        result = plaintext.decode("utf-8")
        wipe_buffer(bytearray(plaintext))
        return result


__all__ = ["CrypterAES256"]
