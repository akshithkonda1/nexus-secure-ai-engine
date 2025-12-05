"""Deterministic lineage tracking for responses."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict
import hashlib
import uuid


@dataclass
class LineageRecord:
    request_hash: str
    response_hash: str
    lineage_id: str
    created_at: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)


class ResponseLineage:
    """Creates verifiable lineage records based on stable hashing."""

    def __init__(self, namespace: uuid.UUID | None = None):
        self.namespace = namespace or uuid.NAMESPACE_OID

    @staticmethod
    def _hash_payload(payload: str) -> str:
        hasher = hashlib.sha256()
        hasher.update(payload.encode("utf-8"))
        return hasher.hexdigest()

    def generate(self, request: str, response: str, metadata: Dict[str, Any] | None = None) -> LineageRecord:
        request_hash = self._hash_payload(request)
        response_hash = self._hash_payload(response)
        lineage_id = str(uuid.uuid5(self.namespace, request_hash + response_hash))
        return LineageRecord(
            request_hash=request_hash,
            response_hash=response_hash,
            lineage_id=lineage_id,
            created_at=datetime.now(tz=timezone.utc),
            metadata=dict(metadata or {}),
        )

    def verify(self, request: str, response: str, record: LineageRecord) -> bool:
        expected_request_hash = self._hash_payload(request)
        expected_response_hash = self._hash_payload(response)
        if expected_request_hash != record.request_hash or expected_response_hash != record.response_hash:
            return False

        expected_lineage_id = str(uuid.uuid5(self.namespace, record.request_hash + record.response_hash))
        return expected_lineage_id == record.lineage_id
