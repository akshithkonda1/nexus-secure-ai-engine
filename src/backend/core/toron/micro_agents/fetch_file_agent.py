"""Micro-agent for safely fetching file contents."""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict


def run(file_path: str) -> Dict[str, Any]:
    base_path = Path("/workspace")
    target = (base_path / file_path).resolve()
    if not str(target).startswith(str(base_path)):
        raise PermissionError("Path is outside of workspace")

    content = target.read_text(encoding="utf-8") if target.exists() else ""
    return {"file_path": str(target), "content": content}

