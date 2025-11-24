"""AES-256-GCM utilities shared with the Ryuzen frontend."""
from __future__ import annotations

import base64
import os
from dataclasses import dataclass
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


@dataclass
class AESGCMEngine:
    """Simple AES-256-GCM encrypt/decrypt helper.

    The key is expected to be a 32-byte value sourced from the environment
    variable ``RYUZEN_AES_KEY`` encoded in base64 or raw bytes.
    """

    key: bytes

    @classmethod
    def from_env(cls) -> "AESGCMEngine":
        key_source = os.environ.get("RYUZEN_AES_KEY", "")
        key: Optional[bytes] = None
        if key_source:
            try:
                key = base64.b64decode(key_source)
            except Exception:
                key = key_source.encode("utf-8")
        if not key:
            key = AESGCM.generate_key(bit_length=256)
        if len(key) != 32:
            raise ValueError("AES-256-GCM requires a 32-byte key")
        return cls(key)

    def encrypt(self, plaintext: bytes, *, aad: bytes | None = None) -> str:
        aes = AESGCM(self.key)
        nonce = os.urandom(12)
        ciphertext = aes.encrypt(nonce, plaintext, aad)
        return base64.b64encode(nonce + ciphertext).decode("utf-8")

    def decrypt(self, token: str, *, aad: bytes | None = None) -> str:
        raw = base64.b64decode(token)
        if len(raw) < 13:
            raise ValueError("Invalid ciphertext")
        nonce, ciphertext = raw[:12], raw[12:]
        aes = AESGCM(self.key)
        plaintext = aes.decrypt(nonce, ciphertext, aad)
        return plaintext.decode("utf-8")


def decrypt_payload(payload: str, *, aad: bytes | None = None) -> str:
    """Decrypt the payload using the shared AES-256-GCM engine.

    Falls back to returning the original payload if decryption fails to
    keep the feedback submission flow resilient.
    """

    engine = AESGCMEngine.from_env()
    try:
        return engine.decrypt(payload, aad=aad)
    except Exception:
        return payload
