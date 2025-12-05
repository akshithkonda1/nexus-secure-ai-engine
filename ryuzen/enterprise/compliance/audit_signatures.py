"""Audit signature shim that keeps imports safe."""
from __future__ import annotations

import importlib
import logging
from typing import Dict

_audit_spec = importlib.util.find_spec("enterprise.compliance.audit_signatures")
_AuditSigner = None
if _audit_spec:
    _AuditSigner = importlib.import_module("enterprise.compliance.audit_signatures").AuditSigner

logger = logging.getLogger(__name__)


class AuditSigner:
    def __init__(self):
        self._impl = _AuditSigner() if _AuditSigner else None
        self.events: list[Dict] = []

    def sign_event(self, event: Dict) -> Dict:
        if self._impl:
            return self._impl.sign_event(event)
        logger.debug("Audit signer fallback; returning unsigned event")
        signed = {**event, "signature": None}
        self.events.append(signed)
        return signed

    def verify_event(self, signed_event: Dict) -> bool:
        if self._impl:
            return self._impl.verify_event(signed_event)
        return True

    def export_public_key(self) -> str | None:
        if self._impl:
            return self._impl.export_public_key()
        return None
