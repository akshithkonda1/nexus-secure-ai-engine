"""Encrypted audit trail that records metadata without model content."""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Dict, List, Optional

from src.backend.security.CrypterAES256 import CrypterAES256
from src.backend.utils.Logging import SafeLogger


@dataclass
class AuditEvent:
    timestamp: float
    model: str
    latency_ms: float
    risk_score: float
    drift_score: float
    tenant_id: str
    route_taken: List[str]


class EncryptedAuditTrail:
    """Appends encrypted audit entries with AES-256-GCM and key rotation."""

    def __init__(self, crypter: Optional[CrypterAES256] = None) -> None:
        self.crypter = crypter or CrypterAES256()
        self.logger = SafeLogger("ryuzen-audit")
        self._log: List[bytes] = []

    def record(self, event: AuditEvent) -> bytes:
        payload: Dict[str, object] = {
            "ts": event.timestamp,
            "model": event.model,
            "latency_ms": round(event.latency_ms, 3),
            "risk": round(event.risk_score, 3),
            "drift": round(event.drift_score, 3),
            "tenant_id": event.tenant_id,
            "route": list(event.route_taken),
        }
        encrypted = self.crypter.encrypt(payload, metadata={"tenant_id": event.tenant_id})
        self._log.append(encrypted)
        self.logger.info(
            "audit-event",
            tenant_id=event.tenant_id,
            model=event.model,
            latency_ms=payload["latency_ms"],
            risk=payload["risk"],
            drift=payload["drift"],
        )
        return encrypted

    def latest(self, limit: int = 10) -> List[bytes]:
        return list(self._log[-limit:])

    def rotate_key(self) -> None:
        """Rotate encryption key for forward secrecy."""

        self.crypter.key_manager.rotate_key()

    def export_for_offline_review(self) -> List[bytes]:
        """Provide encrypted records for downstream SIEM without decryption."""

        return list(self._log)

    def heartbeat(self) -> None:
        """Emit a heartbeat entry to ensure logging path is healthy."""

        now = time.time()
        heartbeat_event = AuditEvent(
            timestamp=now,
            model="heartbeat",
            latency_ms=0.0,
            risk_score=0.0,
            drift_score=0.0,
            tenant_id="system",
            route_taken=[],
        )
        self.record(heartbeat_event)


__all__ = ["EncryptedAuditTrail", "AuditEvent"]
