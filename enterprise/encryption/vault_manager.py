"""
Vault manager orchestrating device-bound keys, envelope encryption and corruption detection.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

from .device_bound_keys import DeviceBoundKeyManager
from .envelope_encryption import EnvelopeEncryption, Envelope


@dataclass
class VaultRecord:
    key_id: str
    envelope: Envelope
    checksum: str
    metadata: Dict[str, str]

    def serialize(self) -> str:
        return json.dumps(
            {
                "key_id": self.key_id,
                "envelope": self.envelope.serialize(),
                "checksum": self.checksum,
                "metadata": self.metadata,
            }
        )

    @classmethod
    def deserialize(cls, payload: str) -> "VaultRecord":
        raw = json.loads(payload)
        return cls(
            key_id=raw["key_id"],
            envelope=Envelope.deserialize(raw["envelope"]),
            checksum=raw["checksum"],
            metadata=raw.get("metadata", {}),
        )


class VaultManager:
    def __init__(self, user_id: str, root: Path | str = "~/.ryuzen/vaults", zero_knowledge: bool = False):
        self.root = Path(root).expanduser()
        self.root.mkdir(parents=True, exist_ok=True)
        self.user_id = user_id
        self.km = DeviceBoundKeyManager(self.root, zero_knowledge=zero_knowledge)
        self.master_key = self._derive_master_key(self.km.get_or_create_user_key(user_id))
        self.enveloper = EnvelopeEncryption(self.master_key)

    def _derive_master_key(self, device_key: bytes) -> bytes:
        hkdf = HKDF(algorithm=hashes.SHA256(), length=32, salt=b"vault", info=self.user_id.encode())
        return hkdf.derive(device_key)

    def _path(self, name: str) -> Path:
        return self.root / f"{self.user_id}_{name}.vault"

    def store(self, name: str, data: bytes, metadata: Optional[Dict[str, str]] = None) -> VaultRecord:
        envelope = self.enveloper.encrypt(data, associated_data=name.encode())
        checksum = EnvelopeEncryption.checksum(envelope)
        record = VaultRecord(key_id=name, envelope=envelope, checksum=checksum, metadata=metadata or {})
        if not self.km.zero_knowledge:
            self._path(name).write_text(record.serialize())
        return record

    def load(self, name: str) -> bytes:
        path = self._path(name)
        payload = VaultRecord.deserialize(path.read_text())
        if payload.checksum != EnvelopeEncryption.checksum(payload.envelope):
            raise RuntimeError("Corruption detected in vault record")
        return self.enveloper.decrypt(payload.envelope)

    def sync_to_cloud(self, name: str, cloud_key: bytes) -> Dict[str, str]:
        """Double encrypts the local vault for cloud sync using BYOK master."""
        path = self._path(name)
        payload = VaultRecord.deserialize(path.read_text())
        cloud_enveloper = EnvelopeEncryption(cloud_key)
        outer_envelope = cloud_enveloper.encrypt(payload.serialize().encode(), associated_data=b"cloud-sync")
        marker = EnvelopeEncryption.checksum(outer_envelope)
        return {
            "ciphertext": outer_envelope.ciphertext.hex(),
            "nonce": outer_envelope.nonce.hex(),
            "wrapped_data_key": outer_envelope.wrapped_data_key.hex(),
            "wrapped_nonce": outer_envelope.wrapped_nonce.hex(),
            "associated_data": outer_envelope.associated_data.hex() if outer_envelope.associated_data else None,
            "tamper_marker": marker,
        }

    def restore_from_cloud(self, name: str, cloud_payload: Dict[str, str], cloud_key: bytes) -> None:
        envelope = Envelope(
            ciphertext=bytes.fromhex(cloud_payload["ciphertext"]),
            nonce=bytes.fromhex(cloud_payload["nonce"]),
            wrapped_data_key=bytes.fromhex(cloud_payload["wrapped_data_key"]),
            wrapped_nonce=bytes.fromhex(cloud_payload["wrapped_nonce"]),
            associated_data=bytes.fromhex(cloud_payload["associated_data"]) if cloud_payload.get("associated_data") else None,
        )
        expected_marker = EnvelopeEncryption.checksum(envelope)
        if expected_marker != cloud_payload.get("tamper_marker"):
            raise RuntimeError("Cloud payload tampered")
        cloud_enveloper = EnvelopeEncryption(cloud_key)
        serialized_record = cloud_enveloper.decrypt(envelope)
        record = VaultRecord.deserialize(serialized_record.decode())
        if record.checksum != EnvelopeEncryption.checksum(record.envelope):
            raise RuntimeError("Restored vault corrupted")
        self._path(name).write_text(record.serialize())
