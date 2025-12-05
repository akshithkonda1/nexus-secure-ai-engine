"""In-memory Bring Your Own Key manager."""
from __future__ import annotations

from typing import Dict
import base64
import hashlib
import secrets


class BYOKManager:
    """Manages symmetric keys and provides deterministic reversible transforms."""

    def __init__(self) -> None:
        self._keys: Dict[str, bytes] = {}

    def create_key(self, key_id: str | None = None, key_material: bytes | None = None) -> str:
        key_id = key_id or f"key-{len(self._keys) + 1}"
        if key_id in self._keys:
            raise ValueError(f"Key '{key_id}' already exists")
        key_material = key_material or secrets.token_bytes(32)
        self._keys[key_id] = bytes(key_material)
        return key_id

    def _derive_stream(self, key_id: str, length: int) -> bytes:
        if key_id not in self._keys:
            raise KeyError(f"Unknown key id '{key_id}'")
        key_material = self._keys[key_id]
        digest = hashlib.sha256(key_material).digest()
        stream = (digest * ((length // len(digest)) + 1))[:length]
        return stream

    def encrypt(self, key_id: str, plaintext: str) -> str:
        stream = self._derive_stream(key_id, len(plaintext.encode("utf-8")))
        cipher_bytes = bytes(b ^ stream[i] for i, b in enumerate(plaintext.encode("utf-8")))
        return base64.urlsafe_b64encode(cipher_bytes).decode("ascii")

    def decrypt(self, key_id: str, ciphertext: str) -> str:
        cipher_bytes = base64.urlsafe_b64decode(ciphertext.encode("ascii"))
        stream = self._derive_stream(key_id, len(cipher_bytes))
        plain_bytes = bytes(b ^ stream[i] for i, b in enumerate(cipher_bytes))
        return plain_bytes.decode("utf-8")
