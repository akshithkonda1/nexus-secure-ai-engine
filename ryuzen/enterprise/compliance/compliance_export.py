"""Compliance export shim using in-memory storage."""
from __future__ import annotations

import importlib
import logging
from typing import Dict

_export_spec = importlib.util.find_spec("enterprise.compliance.compliance_export")
_ComplianceExport = None
if _export_spec:
    _ComplianceExport = importlib.import_module("enterprise.compliance.compliance_export").ComplianceExport

logger = logging.getLogger(__name__)


class ComplianceExport:
    def __init__(self):
        self._impl = _ComplianceExport() if _ComplianceExport else None
        self.records: list[Dict] = []

    def add_record(self, record: Dict) -> None:
        if self._impl:
            return self._impl.add_record(record)
        self.records.append(record)

    def export_json(self) -> str:
        if self._impl:
            return self._impl.export_json()
        import json

        return json.dumps(self.records, indent=2)

    def export_minimal(self) -> str:
        if self._impl:
            return self._impl.export_minimal()
        import json

        return json.dumps([{k: v for k, v in r.items() if k in ("timestamp", "actor", "action")} for r in self.records])
