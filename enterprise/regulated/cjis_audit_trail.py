from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List

from .tamper_proof_logs import LogEntry, TamperProofLogger

logger = logging.getLogger(__name__)


@dataclass
class CJISAuditRecord:
    actor: str
    category: str
    action: str
    resource: str
    metadata: Dict[str, str] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_log_entry(self) -> LogEntry:
        message = json.dumps({
            "action": self.action,
            "resource": self.resource,
            "metadata": self.metadata,
            "timestamp": self.timestamp,
        }, sort_keys=True)
        return LogEntry(message=message, actor=self.actor, category=self.category)


class CJISAuditTrail:
    """Implements CJIS-style immutable audit logging."""

    def __init__(self) -> None:
        self.logger = TamperProofLogger()
        self.records: List[CJISAuditRecord] = []

    def log(self, actor: str, category: str, action: str, resource: str, metadata: Dict[str, str] | None = None) -> LogEntry:
        record = CJISAuditRecord(actor=actor, category=category, action=action, resource=resource, metadata=metadata or {})
        entry = self.logger.append(message=record.to_log_entry().message, actor=actor, category=category)
        self.records.append(record)
        logger.debug("CJIS audit log recorded for %s %s", category, action)
        return entry

    def export_attested_chain(self) -> Dict[str, object]:
        return {
            "chain": [entry.__dict__ for entry in self.logger.chain],
            "public_key": self.logger.export_public_key_pem(),
            "verified": self.logger.verify_chain(),
        }

    def validate(self) -> bool:
        return self.logger.verify_chain()
