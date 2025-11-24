"""Weekly digest generation leveraging Toron summarization."""
from __future__ import annotations

import datetime
import json
from typing import Any, Dict, List

from src.backend.feedback_system_v2.analyzer import FeedbackAnalyzer, get_analyzer
from src.backend.feedback_system_v2.db_service import FeedbackDBService, get_db_service
from src.backend.feedback_system_v2.logger import STORAGE_DIR


class DigestGenerator:
    def __init__(self, analyzer: FeedbackAnalyzer | None = None, db: FeedbackDBService | None = None) -> None:
        self.analyzer = analyzer or get_analyzer()
        self.db = db or get_db_service()

    def _load_local_feedback(self) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = []
        for path in STORAGE_DIR.glob("*.json"):
            try:
                with path.open("r", encoding="utf-8") as f:
                    records.append(json.load(f))
            except Exception:
                continue
        return records

    def collect_feedback(self) -> List[Dict[str, Any]]:
        records = self._load_local_feedback()
        records.extend(self.db.query_all())
        return records

    def generate_digest(self) -> Dict[str, Any]:
        records = self.collect_feedback()
        analyses = [self.analyzer.analyze(item.get("feedback", ""), session_id=item.get("id")) for item in records]
        avg_priority = self.analyzer.aggregate_priority(analyses)
        summaries = [result.summary for result in analyses]
        digest_summary = "\n".join(summaries[:10])
        return {
            "generated_at": datetime.datetime.utcnow().isoformat(),
            "count": len(records),
            "average_priority": avg_priority,
            "summaries": summaries,
            "digest": digest_summary,
        }


def get_digest_generator() -> DigestGenerator:
    return DigestGenerator()
