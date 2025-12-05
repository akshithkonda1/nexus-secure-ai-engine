"""
Key rotation handling for active/standby/retired lifecycle.
"""
from __future__ import annotations

import queue
import time
from dataclasses import dataclass
from typing import Dict, List, Optional

from .envelope_encryption import EnvelopeEncryption, Envelope


@dataclass
class KeyVersion:
    version: str
    key_material: bytes
    state: str  # active, standby, retired
    created_at: float


class KeyRotationManager:
    def __init__(self):
        self.versions: List[KeyVersion] = []
        self.reencrypt_queue: "queue.Queue[Envelope]" = queue.Queue()

    def add_key(self, version: str, key_material: bytes, state: str = "standby") -> KeyVersion:
        kv = KeyVersion(version=version, key_material=key_material, state=state, created_at=time.time())
        self.versions.append(kv)
        return kv

    def set_active(self, version: str) -> None:
        for kv in self.versions:
            kv.state = "retired" if kv.state == "active" else kv.state
        for kv in self.versions:
            if kv.version == version:
                kv.state = "active"
            elif kv.state != "retired":
                kv.state = "standby"

    def active_key(self) -> Optional[KeyVersion]:
        for kv in self.versions:
            if kv.state == "active":
                return kv
        return None

    def standby_key(self) -> Optional[KeyVersion]:
        for kv in self.versions:
            if kv.state == "standby":
                return kv
        return None

    def retire_key(self, version: str) -> None:
        for kv in self.versions:
            if kv.version == version:
                kv.state = "retired"

    def enqueue_reencryption(self, envelope: Envelope) -> None:
        self.reencrypt_queue.put(envelope)

    def process_reencryption(self, new_key: bytes) -> List[Envelope]:
        enveloper = EnvelopeEncryption(new_key)
        updated = []
        while not self.reencrypt_queue.empty():
            old_env = self.reencrypt_queue.get()
            plaintext = self.active_decryption(old_env)
            updated.append(enveloper.encrypt(plaintext, old_env.associated_data))
        return updated

    def active_decryption(self, envelope: Envelope) -> bytes:
        active = self.active_key()
        if not active:
            raise RuntimeError("No active key configured")
        return EnvelopeEncryption(active.key_material).decrypt(envelope)

    def version_metadata(self) -> Dict[str, str]:
        return {kv.version: kv.state for kv in self.versions}
