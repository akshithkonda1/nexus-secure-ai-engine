"""Multi-stage PII removal pipeline for Ryuzen."""
from __future__ import annotations

import datetime as _dt
from typing import Any, Dict, Optional, Union

from ..utils.JSONSafe import safe_serialize
from ..utils.Normalize import canonicalize_spacing, normalize_whitespace
from ..utils.RegionBucket import ip_to_region
from ..utils.TimeBucket import bucket_timestamp
from ..utils.Logging import SafeLogger
from ..utils.ErrorTypes import SanitizationError
from .PIIRegexLibrary import COMPILED_PATTERNS
from .NERMaskingEngine import NERMaskingEngine
from .MetadataCleaner import (
    remove_hidden_layers,
    strip_document_metadata,
    strip_exif,
    strip_office_metadata,
    strip_pdf_metadata,
)
from .HashingService import generate_rotating_salt, hash_identifier, stable_longitudinal_hash

logger = SafeLogger("pii-pipeline")


class RyuzenPIIRemovalPipeline:
    @staticmethod
    def _regex_stage(text: str) -> str:
        cleaned = text
        for name, pattern in COMPILED_PATTERNS:
            cleaned = pattern.sub(f"[REDACTED_{name}]", cleaned)
        return cleaned

    @staticmethod
    def _ner_stage(text: str, engine: NERMaskingEngine) -> str:
        return engine.mask(text)

    @staticmethod
    def _metadata_stage(raw: Union[str, bytes]) -> Union[str, bytes]:
        if isinstance(raw, bytes):
            pdf_clean = strip_pdf_metadata(raw)
            pdf_clean = remove_hidden_layers(pdf_clean)
            doc_clean = strip_document_metadata(pdf_clean)
            return doc_clean
        return raw

    @staticmethod
    def _placeholder_stage(text: str) -> str:
        # collapse repeated placeholder sequences
        return text.replace("[REDACTED_REDACTED]", "[REDACTED]")

    @staticmethod
    def _normalize_stage(text: str) -> str:
        return canonicalize_spacing(normalize_whitespace(text))

    @staticmethod
    def _hash_stage(text: str, metadata: Optional[Dict[str, Any]]) -> str:
        metadata = metadata or {}
        salt = generate_rotating_salt()
        user = metadata.get("user_id", "anon")
        tenant = metadata.get("tenant_id", "public")
        user_hash = hash_identifier(user, salt)
        tenant_hash = stable_longitudinal_hash(tenant)
        region = ip_to_region(metadata.get("ip") or metadata.get("region"))
        timestamp = metadata.get("timestamp") or _dt.datetime.now(_dt.timezone.utc)
        if timestamp.tzinfo is None or timestamp.utcoffset() is None:
            timestamp = timestamp.replace(tzinfo=_dt.timezone.utc)

        year, month, day, hour = bucket_timestamp(timestamp)
        envelope = {
            "bucket": {"year": year, "month": month, "day": day, "hour": hour},
            "region": region,
            "user_hash": user_hash,
            "tenant_hash": tenant_hash,
            "length": len(text),
        }
        return f"{text}\n<!--telemetry:{safe_serialize(envelope)}-->"

    @staticmethod
    def _sanitize_output(text: str) -> str:
        return text.replace("<", "&lt;").replace(">", "&gt;")

    @staticmethod
    def run(text_or_bytes: Union[str, bytes], metadata: Optional[Dict[str, Any]] = None) -> str:
        try:
            ner_engine = NERMaskingEngine()
            stage0 = RyuzenPIIRemovalPipeline._metadata_stage(text_or_bytes)
            text = stage0.decode("utf-8", errors="ignore") if isinstance(stage0, bytes) else str(stage0)
            stage1 = RyuzenPIIRemovalPipeline._regex_stage(text)
            stage2 = RyuzenPIIRemovalPipeline._ner_stage(stage1, ner_engine)
            stage3 = RyuzenPIIRemovalPipeline._placeholder_stage(stage2)
            stage4 = RyuzenPIIRemovalPipeline._normalize_stage(stage3)
            stage5 = RyuzenPIIRemovalPipeline._hash_stage(stage4, metadata)
            stage6 = RyuzenPIIRemovalPipeline._sanitize_output(stage5)
            return stage6
        except Exception as exc:  # pragma: no cover
            logger.error("pii_pipeline_failure", error=str(exc))
            raise SanitizationError("PII pipeline failed") from exc


__all__ = ["RyuzenPIIRemovalPipeline"]
