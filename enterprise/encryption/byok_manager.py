"""
BYOK manager supporting AWS/Azure/GCP style KMS adapters and metadata signing.
"""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Dict, Optional

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization

from .envelope_encryption import EnvelopeEncryption


class KMSAdapter:
    def __init__(self, name: str):
        self.name = name

    def encrypt(self, key: bytes, plaintext: bytes) -> bytes:
        # Simple symmetric abstraction to mimic KMS encrypt
        return EnvelopeEncryption(key).encrypt(plaintext).serialize().encode()

    def decrypt(self, key: bytes, ciphertext: bytes) -> bytes:
        envelope = EnvelopeEncryption(key)
        return envelope.decrypt(EnvelopeEncryption.deserialize(ciphertext.decode()))


@dataclass
class BYOKSlot:
    key_id: str
    key_material: bytes
    kms: str
    created_at: float
    active: bool = True


class BYOKManager:
    def __init__(self):
        self.tenants: Dict[str, Dict[str, BYOKSlot]] = {}
        self.signing_key = Ed25519PrivateKey.generate()

    def _get_signing_public_pem(self) -> str:
        return (
            self.signing_key.public_key()
            .public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo)
            .decode()
        )

    def register_tenant_key(self, tenant_id: str, key_id: str, key_material: bytes, provider: str) -> BYOKSlot:
        slot = BYOKSlot(key_id=key_id, key_material=key_material, kms=provider, created_at=time.time(), active=True)
        self.tenants.setdefault(tenant_id, {})[key_id] = slot
        return slot

    def rotate_key(self, tenant_id: str, new_key_id: str, key_material: bytes, provider: str) -> BYOKSlot:
        for slot in self.tenants.get(tenant_id, {}).values():
            slot.active = False
        return self.register_tenant_key(tenant_id, new_key_id, key_material, provider)

    def get_active_key(self, tenant_id: str) -> Optional[BYOKSlot]:
        for slot in self.tenants.get(tenant_id, {}).values():
            if slot.active:
                return slot
        return None

    def encrypt_for_tenant(self, tenant_id: str, plaintext: bytes, aad: Optional[bytes] = None) -> Dict[str, str]:
        slot = self.get_active_key(tenant_id)
        if not slot:
            raise RuntimeError("No BYOK key registered for tenant")
        enveloper = EnvelopeEncryption(slot.key_material)
        envelope = enveloper.encrypt(plaintext, associated_data=aad)
        metadata = {
            "tenant_id": tenant_id,
            "key_id": slot.key_id,
            "kms": slot.kms,
            "timestamp": time.time(),
        }
        signature = self._sign_metadata(metadata)
        return {**metadata, "envelope": envelope.serialize(), "signature": signature}

    def decrypt_for_tenant(self, tenant_id: str, package: Dict[str, str], aad: Optional[bytes] = None) -> bytes:
        if package.get("tenant_id") != tenant_id:
            raise RuntimeError("Tenant mismatch")
        slot = self.tenants.get(tenant_id, {}).get(package.get("key_id"))
        if not slot:
            raise RuntimeError("Unknown key slot")
        envelope = EnvelopeEncryption.deserialize(package["envelope"])
        verifier = self.signing_key.public_key()
        self._verify_metadata({k: package[k] for k in ("tenant_id", "key_id", "kms", "timestamp")}, package["signature"], verifier)
        enveloper = EnvelopeEncryption(slot.key_material)
        return enveloper.decrypt(envelope)

    def _sign_metadata(self, metadata: Dict[str, str]) -> str:
        payload = str(sorted(metadata.items())).encode()
        signature = self.signing_key.sign(payload)
        return signature.hex()

    def _verify_metadata(self, metadata: Dict[str, str], signature_hex: str, public_key) -> None:
        payload = str(sorted(metadata.items())).encode()
        public_key.verify(bytes.fromhex(signature_hex), payload)

    def signing_public_key(self) -> str:
        return self._get_signing_public_pem()
