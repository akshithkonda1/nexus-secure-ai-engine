from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, Tuple

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from .pii_redaction_engine import PIIRedactionEngine, RedactionResult

logger = logging.getLogger(__name__)


@dataclass
class HIPAADataGuard:
    """Protects PHI across request/response and storage flows."""

    pii_engine: PIIRedactionEngine
    encryption_key: bytes

    @classmethod
    def with_random_key(cls, pii_engine: PIIRedactionEngine | None = None) -> "HIPAADataGuard":
        key = AESGCM.generate_key(bit_length=256)
        return cls(pii_engine=pii_engine or PIIRedactionEngine(), encryption_key=key)

    def redact_and_encrypt(self, payload: str, associated_data: str | None = None) -> Tuple[RedactionResult, bytes, bytes]:
        redaction = self.pii_engine.redact(payload)
        nonce = os.urandom(12)
        aesgcm = AESGCM(self.encryption_key)
        ciphertext = aesgcm.encrypt(nonce, redaction.redacted_text.encode("utf-8"), (associated_data or "").encode("utf-8"))
        logger.debug("Payload redacted (%d findings) and encrypted.", len(redaction.findings))
        return redaction, nonce, ciphertext

    def decrypt(self, nonce: bytes, ciphertext: bytes, associated_data: str | None = None) -> str:
        aesgcm = AESGCM(self.encryption_key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, (associated_data or "").encode("utf-8"))
        return plaintext.decode("utf-8")

    def guard_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        content = str(request.get("content", ""))
        redaction, nonce, ciphertext = self.redact_and_encrypt(content, associated_data=request.get("actor", ""))
        guarded = {
            **request,
            "content": ciphertext,
            "nonce": nonce,
            "pii_findings": [finding.model_dump() for finding in redaction.findings],
        }
        logger.info("HIPAA guard applied; content sealed with AES-256-GCM")
        return guarded

    def guard_response(self, response: Dict[str, Any], nonce: bytes) -> Dict[str, Any]:
        decrypted = self.decrypt(nonce, response.get("content", b""), associated_data=response.get("actor", ""))
        redaction = self.pii_engine.redact(decrypted)
        sanitized = {**response, "content": redaction.redacted_text, "pii_findings": [f.model_dump() for f in redaction.findings]}
        logger.info("HIPAA guard sanitized response with %d findings", len(redaction.findings))
        return sanitized
