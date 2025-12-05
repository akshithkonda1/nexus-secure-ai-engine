from __future__ import annotations

import base64
import hashlib
import logging
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from cryptography.hazmat.primitives import serialization

logger = logging.getLogger(__name__)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hash_content(content: str, salt: Optional[bytes] = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.sha256()
    digest.update(salt)
    digest.update(content.encode("utf-8"))
    return f"{base64.urlsafe_b64encode(salt).decode()}:{digest.hexdigest()}"


@dataclass
class LogEntry:
    message: str
    actor: str
    category: str
    timestamp: str = field(default_factory=_now_iso)
    hash_anchor: Optional[str] = None
    signature: Optional[str] = None

    def serialize(self) -> str:
        return f"{self.timestamp}|{self.actor}|{self.category}|{self.message}|{self.hash_anchor or ''}"


class TamperProofLogger:
    def __init__(self, private_key: Optional[Ed25519PrivateKey] = None) -> None:
        self.private_key = private_key or Ed25519PrivateKey.generate()
        self.public_key: Ed25519PublicKey = self.private_key.public_key()
        self.chain: List[LogEntry] = []

    def sign_entry(self, entry: LogEntry, previous_hash: Optional[str]) -> LogEntry:
        anchor_material = entry.serialize() + (previous_hash or "")
        hash_anchor = _hash_content(anchor_material)
        signature = self.private_key.sign(anchor_material.encode("utf-8"))
        entry.hash_anchor = hash_anchor
        entry.signature = base64.urlsafe_b64encode(signature).decode()
        logger.debug("Signed log entry with anchor %s", hash_anchor)
        return entry

    def append(self, message: str, actor: str, category: str) -> LogEntry:
        prev_hash = self.chain[-1].hash_anchor if self.chain else None
        entry = LogEntry(message=message, actor=actor, category=category)
        signed_entry = self.sign_entry(entry, prev_hash)
        self.chain.append(signed_entry)
        logger.info("Tamper-proof log appended: %s", signed_entry.serialize())
        return signed_entry

    def verify_chain(self) -> bool:
        for idx, entry in enumerate(self.chain):
            prev_hash = self.chain[idx - 1].hash_anchor if idx > 0 else None
            anchor_material = entry.serialize() + (prev_hash or "")
            expected_hash = _hash_content(anchor_material, salt=self._extract_salt(entry.hash_anchor))
            if expected_hash != entry.hash_anchor:
                logger.error("Hash mismatch at position %s", idx)
                return False
            try:
                signature = base64.urlsafe_b64decode(entry.signature or "")
                self.public_key.verify(signature, anchor_material.encode("utf-8"))
            except Exception as exc:  # cryptography raises InvalidSignature etc.
                logger.error("Signature verification failed at %s: %s", idx, exc)
                return False
        return True

    @staticmethod
    def _extract_salt(hash_anchor: Optional[str]) -> Optional[bytes]:
        if not hash_anchor:
            return None
        salt_b64, _ = hash_anchor.split(":", 1)
        return base64.urlsafe_b64decode(salt_b64)

    def export_public_key_pem(self) -> str:
        pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        return pem.decode()

    def export_private_key_pem(self) -> str:
        pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        return pem.decode()
