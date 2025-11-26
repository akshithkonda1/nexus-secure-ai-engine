"""Simple workspace versioning utility for micro-agent writes."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

ROOT = Path("/workspace_history")


def record_revision(file_id: str, before: str, after: str, metadata: Dict[str, Any]) -> Path:
    """Persist a revision record to the workspace history folder."""

    timestamp = datetime.utcnow().isoformat()
    revision_dir = ROOT / file_id
    revision_dir.mkdir(parents=True, exist_ok=True)
    revision_path = revision_dir / f"{timestamp}.json"

    payload = {
        "file_id": file_id,
        "timestamp": timestamp,
        "before": before,
        "after": after,
        "metadata": metadata,
    }

    revision_path.write_text(json.dumps(payload, indent=2))
    return revision_path

