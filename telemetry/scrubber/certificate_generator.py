"""Zero-PII certificate generation utilities."""
from __future__ import annotations

from datetime import datetime, timezone
import json
import logging
import os
from typing import Dict, Tuple

logger = logging.getLogger(__name__)


def generate_certificate(partner: str, month: str) -> Tuple[Dict[str, str], str]:
    """Generate a Zero-PII certificate payload for a bundle.

    Args:
        partner: Partner identifier.
        month: Target month in ``YYYY-MM`` format.

    Returns:
        A tuple of (certificate_payload, certificate_s3_ref).
    """

    certificate_bucket = os.getenv("RYZN_CERTIFICATE_BUCKET", "ryzn-telemetry-certificates")
    certificate_prefix = os.getenv("RYZN_CERTIFICATE_PREFIX", "zero-pii")
    certificate_ref = f"s3://{certificate_bucket}/{certificate_prefix}/{partner}/{month}/zero_pii_certificate.json"

    certificate = {
        "partner": partner,
        "month": month,
        "sanitized": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "certificate_ref": certificate_ref,
        "statement": "Dataset has been sanitized and is free of user PII.",
    }
    logger.info("Generated Zero-PII certificate for partner=%s month=%s", partner, month)
    logger.debug("Certificate payload: %s", json.dumps(certificate, indent=2))
    return certificate, certificate_ref


__all__ = ["generate_certificate"]
