"""
Compliance export helper for producing audit-ready bundles.
"""
from __future__ import annotations

import json
from typing import Dict, List


class ComplianceExport:
    def __init__(self):
        self.records: List[Dict] = []

    def add_record(self, record: Dict) -> None:
        self.records.append(record)

    def export_json(self) -> str:
        return json.dumps(self.records, indent=2)

    def export_minimal(self) -> str:
        return json.dumps([{k: v for k, v in r.items() if k in ("timestamp", "actor", "action") } for r in self.records])
