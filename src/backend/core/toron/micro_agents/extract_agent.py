"""Micro-agent for extracting keywords from text."""
from __future__ import annotations

from typing import Any, Dict, List


def run(text: str, top_k: int = 5) -> Dict[str, Any]:
    words = [word.strip(".,;:!?()[]{}\"'") for word in text.split() if len(word) > 3]
    unique: List[str] = []
    for word in words:
        lower = word.lower()
        if lower not in unique:
            unique.append(lower)
    return {"keywords": unique[:top_k], "total_candidates": len(unique)}

