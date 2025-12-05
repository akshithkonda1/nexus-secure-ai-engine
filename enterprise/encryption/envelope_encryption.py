"""
Envelope encryption utilities implementing AES-256-GCM for payloads
and master-key wrapping for transport.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from hashlib import blake2b
from typing import Any, Dict, Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


@dataclass
class Envelope:
    ciphertext: bytes
    nonce: bytes
    wrapped_data_key: bytes
    wrapped_nonce: bytes
    associated_data: Optional[bytes] = None

    def serialize(self) -> str:
        payload = {
            "ciphertext": self.ciphertext.hex(),
            "nonce": self.nonce.hex(),
            "wrapped_data_key": self.wrapped_data_key.hex(),
            "wrapped_nonce": self.wrapped_nonce.hex(),
            "associated_data": self.associated_data.hex() if self.associated_data else None,
        }
        return json.dumps(payload)

    @classmethod
    def deserialize(cls, payload: str) -> "Envelope":
        data = json.loads(payload)
        return cls(
            ciphertext=bytes.fromhex(data["ciphertext"]),
            nonce=bytes.fromhex(data["nonce"]),
            wrapped_data_key=bytes.fromhex(data["wrapped_data_key"]),
            wrapped_nonce=bytes.fromhex(data["wrapped_nonce"]),
            associated_data=bytes.fromhex(data["associated_data"]) if data.get("associated_data") else None,
        )


class EnvelopeEncryption:
    def __init__(self, master_key: bytes):
        if len(master_key) != 32:
            raise ValueError("Master key must be 256 bits")
        self.master_key = master_key

    def _wrap_key(self, data_key: bytes, aad: Optional[bytes]) -> tuple[bytes, bytes]:
        nonce = os.urandom(12)
        aead = AESGCM(self.master_key)
        wrapped = aead.encrypt(nonce, data_key, aad)
        return nonce, wrapped

    def _unwrap_key(self, wrapped_nonce: bytes, wrapped_data: bytes, aad: Optional[bytes]) -> bytes:
        aead = AESGCM(self.master_key)
        return aead.decrypt(wrapped_nonce, wrapped_data, aad)

    def encrypt(self, plaintext: bytes, associated_data: Optional[bytes] = None) -> Envelope:
        data_key = AESGCM.generate_key(bit_length=256)
        data_nonce = os.urandom(12)
        cipher = AESGCM(data_key)
        ciphertext = cipher.encrypt(data_nonce, plaintext, associated_data)
        wrapped_nonce, wrapped_key = self._wrap_key(data_key, associated_data)
        return Envelope(ciphertext=ciphertext, nonce=data_nonce, wrapped_data_key=wrapped_key, wrapped_nonce=wrapped_nonce, associated_data=associated_data)

    def decrypt(self, envelope: Envelope) -> bytes:
        data_key = self._unwrap_key(envelope.wrapped_nonce, envelope.wrapped_data_key, envelope.associated_data)
        cipher = AESGCM(data_key)
        return cipher.decrypt(envelope.nonce, envelope.ciphertext, envelope.associated_data)

    @staticmethod
    def deserialize(payload: str) -> Envelope:
        return Envelope.deserialize(payload)

    @staticmethod
    def checksum(envelope: Envelope) -> str:
        h = blake2b(digest_size=32)
        h.update(envelope.ciphertext)
        h.update(envelope.wrapped_data_key)
        if envelope.associated_data:
            h.update(envelope.associated_data)
        return h.hexdigest()
