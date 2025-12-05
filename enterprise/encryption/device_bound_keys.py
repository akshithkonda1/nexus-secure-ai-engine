"""
Device-bound key management implementing AES-256-GCM backed vault keys.
"""
from __future__ import annotations

import json
import os
import platform
import uuid
from dataclasses import dataclass
from hashlib import blake2b
from pathlib import Path
from typing import Tuple

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


@dataclass
class DeviceFingerprint:
    os: str
    architecture: str
    machine: str
    processor: str
    uuid: str

    @classmethod
    def capture(cls) -> "DeviceFingerprint":
        return cls(
            os=platform.system(),
            architecture=platform.machine(),
            machine=platform.node(),
            processor=platform.processor(),
            uuid=str(uuid.getnode()),
        )

    def digest(self) -> bytes:
        h = blake2b(digest_size=32)
        for part in (self.os, self.architecture, self.machine, self.processor, self.uuid):
            h.update(part.encode())
        return h.digest()


class DeviceBoundKeyManager:
    def __init__(self, base_dir: Path | str = "~/.ryuzen/vaults", zero_knowledge: bool = False):
        self.base_dir = Path(base_dir).expanduser()
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.zero_knowledge = zero_knowledge

    def _vault_path(self, user_id: str) -> Path:
        return self.base_dir / f"{user_id}.vault"

    def _generate_key(self) -> bytes:
        return AESGCM.generate_key(bit_length=256)

    def _tamper_marker(self, key_material: bytes, fingerprint: DeviceFingerprint) -> str:
        h = blake2b(digest_size=32)
        h.update(key_material)
        h.update(fingerprint.digest())
        return h.hexdigest()

    def _encrypt_key(self, key: bytes, fingerprint: DeviceFingerprint) -> Tuple[bytes, bytes]:
        nonce = os.urandom(12)
        aead = AESGCM(fingerprint.digest())
        ciphertext = aead.encrypt(nonce, key, None)
        return nonce, ciphertext

    def _decrypt_key(self, nonce: bytes, ciphertext: bytes, fingerprint: DeviceFingerprint) -> bytes:
        aead = AESGCM(fingerprint.digest())
        return aead.decrypt(nonce, ciphertext, None)

    def get_or_create_user_key(self, user_id: str) -> bytes:
        path = self._vault_path(user_id)
        fingerprint = DeviceFingerprint.capture()
        if path.exists():
            payload = json.loads(path.read_text())
            if payload.get("fingerprint") != fingerprint.digest().hex():
                raise RuntimeError("Device fingerprint mismatch or tampering detected")
            nonce = bytes.fromhex(payload["nonce"])
            ciphertext = bytes.fromhex(payload["ciphertext"])
            key = self._decrypt_key(nonce, ciphertext, fingerprint)
            marker = payload.get("marker")
            if marker != self._tamper_marker(key, fingerprint):
                raise RuntimeError("Vault tampering detected")
            return key

        key = self._generate_key()
        nonce, ciphertext = self._encrypt_key(key, fingerprint)
        marker = self._tamper_marker(key, fingerprint)
        record = {
            "nonce": nonce.hex(),
            "ciphertext": ciphertext.hex(),
            "fingerprint": fingerprint.digest().hex(),
            "marker": marker,
            "zero_knowledge": self.zero_knowledge,
        }
        if not self.zero_knowledge:
            path.write_text(json.dumps(record))
        return key

    def store_local_key(self, user_id: str, key: bytes) -> None:
        fingerprint = DeviceFingerprint.capture()
        nonce, ciphertext = self._encrypt_key(key, fingerprint)
        marker = self._tamper_marker(key, fingerprint)
        record = {
            "nonce": nonce.hex(),
            "ciphertext": ciphertext.hex(),
            "fingerprint": fingerprint.digest().hex(),
            "marker": marker,
            "zero_knowledge": self.zero_knowledge,
        }
        if not self.zero_knowledge:
            self._vault_path(user_id).write_text(json.dumps(record))

    def verify_integrity(self, user_id: str) -> bool:
        path = self._vault_path(user_id)
        if not path.exists():
            return False
        payload = json.loads(path.read_text())
        fingerprint = DeviceFingerprint.capture()
        if payload.get("fingerprint") != fingerprint.digest().hex():
            return False
        try:
            key = self._decrypt_key(bytes.fromhex(payload["nonce"]), bytes.fromhex(payload["ciphertext"]), fingerprint)
            return payload.get("marker") == self._tamper_marker(key, fingerprint)
        except Exception:
            return False
