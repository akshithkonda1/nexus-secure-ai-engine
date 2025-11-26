"""Micro-agent for appending structured notes to workspace history."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from src.backend.core.workspace.workspace_versioning import record_revision


def run(note: str, topic: str = "general", actor: str | None = None) -> Dict[str, Any]:
    timestamp = datetime.utcnow().isoformat()
    payload = {"note": note, "topic": topic, "timestamp": timestamp, "actor": actor}
    revision_path = record_revision(file_id=f"notes-{topic}", before="", after=note, metadata=payload)
    return {"stored": True, "revision": str(revision_path)}

