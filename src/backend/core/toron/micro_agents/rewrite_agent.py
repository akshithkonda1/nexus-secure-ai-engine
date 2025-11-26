"""Micro-agent for rewriting text with minimal transformations."""
from __future__ import annotations

from typing import Any, Dict


def run(text: str, tone: str | None = None) -> Dict[str, Any]:
    rewritten = text.strip()
    if tone:
        rewritten = f"[{tone}] {rewritten}"
    return {"original": text, "rewritten": rewritten}

