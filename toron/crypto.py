"""AES-256-GCM encryption helpers."""

from __future__ import annotations

import base64
import os
from dataclasses import dataclass
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def generate_key() -> bytes:
    """Generate a 256-bit key suitable for AES-GCM encryption."""

    return AESGCM.generate_key(bit_length=256)


@dataclass
class CrypterAES256:
    """Perform authenticated encryption using AES-256-GCM."""

    key: bytes

    def __post_init__(self) -> None:
        if len(self.key) != 32:
            raise ValueError("AES-256 requires a 32-byte key")

    def encrypt(self, plaintext: str, associated_data: Optional[bytes] = None) -> str:
        """Encrypt text and return a base64 token."""

        nonce = os.urandom(12)
        aes = AESGCM(self.key)
        ciphertext = aes.encrypt(nonce, plaintext.encode(), associated_data)
        return base64.b64encode(nonce + ciphertext).decode()

    def decrypt(self, token: str, associated_data: Optional[bytes] = None) -> str:
        """Decrypt a base64 token back to plaintext."""

        data = base64.b64decode(token)
        nonce, ciphertext = data[:12], data[12:]
        aes = AESGCM(self.key)
        plaintext = aes.decrypt(nonce, ciphertext, associated_data)
        return plaintext.decode()
