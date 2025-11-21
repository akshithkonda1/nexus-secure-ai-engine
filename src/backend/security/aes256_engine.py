"""AES-256-GCM encryption utilities."""
from __future__ import annotations

import base64
import os
from typing import Tuple

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class AES256Engine:
    def __init__(self, key: bytes | None = None) -> None:
        key_source = key or os.environ.get("RYUZEN_AES_KEY")
        if isinstance(key_source, str):
            key_bytes = base64.urlsafe_b64decode(key_source + "==")
        else:
            key_bytes = key_source
        self.key = key_bytes or AESGCM.generate_key(bit_length=256)
        self._aesgcm = AESGCM(self.key)

    def encrypt(self, plaintext: str, associated_data: bytes | None = None) -> str:
        nonce = os.urandom(12)
        ciphertext = self._aesgcm.encrypt(nonce, plaintext.encode("utf-8"), associated_data)
        payload = nonce + ciphertext
        return base64.urlsafe_b64encode(payload).decode("utf-8")

    def decrypt(self, token: str, associated_data: bytes | None = None) -> str:
        payload = base64.urlsafe_b64decode(token)
        nonce, ciphertext = payload[:12], payload[12:]
        plaintext = self._aesgcm.decrypt(nonce, ciphertext, associated_data)
        return plaintext.decode("utf-8")

    def export_key(self) -> str:
        return base64.urlsafe_b64encode(self.key).decode("utf-8")
