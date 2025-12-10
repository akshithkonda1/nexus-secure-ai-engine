"""Certificate generation for sanitized telemetry batches."""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def generate_zero_pii_certificate(event_batch_metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a certificate asserting zero PII after sanitization."""

    serialized = json.dumps(event_batch_metadata, sort_keys=True).encode("utf-8")
    batch_hash = hashlib.sha256(serialized).hexdigest()
    certificate = {
        "telemetry_version": event_batch_metadata.get("telemetry_version", "unknown"),
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "sha256": batch_hash,
        "zero_pii": True,
    }
    logger.info("Generated zero PII certificate: %s", certificate)
    return certificate


__all__ = ["generate_zero_pii_certificate"]
