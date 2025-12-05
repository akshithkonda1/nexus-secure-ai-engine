"""
Audit log signing using Ed25519.
"""
from __future__ import annotations

import json
from typing import Dict, List

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization


class AuditSigner:
    def __init__(self):
        self.key = Ed25519PrivateKey.generate()
        self.events: List[Dict] = []

    def sign_event(self, event: Dict) -> Dict:
        payload = json.dumps(event, sort_keys=True).encode()
        signature = self.key.sign(payload).hex()
        signed = {**event, "signature": signature}
        self.events.append(signed)
        return signed

    def verify_event(self, signed_event: Dict) -> bool:
        payload = json.dumps({k: v for k, v in signed_event.items() if k != "signature"}, sort_keys=True).encode()
        try:
            self.key.public_key().verify(bytes.fromhex(signed_event["signature"]), payload)
            return True
        except Exception:
            return False

    def export_public_key(self) -> str:
        return (
            self.key.public_key()
            .public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo)
            .decode()
        )
