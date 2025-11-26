"""Micro-agent for controlled workspace writes with versioning."""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from src.backend.core.workspace.workspace_versioning import record_revision


def run(file_path: str, content: str, actor: str | None = None, plan_id: str | None = None) -> Dict[str, Any]:
    base_path = Path("/workspace")
    target = (base_path / file_path).resolve()
    if not str(target).startswith(str(base_path)):
        raise PermissionError("Path is outside of workspace")

    target.parent.mkdir(parents=True, exist_ok=True)
    before = target.read_text(encoding="utf-8") if target.exists() else ""
    target.write_text(content, encoding="utf-8")
    revision_path = record_revision(
        file_id=target.name,
        before=before,
        after=content,
        metadata={"actor": actor, "plan_id": plan_id, "file_path": str(target)},
    )

    return {"file_path": str(target), "revision": str(revision_path)}

