"""Micro-agent for summarizing text content."""
from __future__ import annotations

from typing import Any, Dict


def run(text: str, max_sentences: int = 3) -> Dict[str, Any]:
    sentences = [part.strip() for part in text.split(".") if part.strip()]
    summary = ". ".join(sentences[:max_sentences])
    if summary:
        summary = f"{summary}." if not summary.endswith(".") else summary
    return {"summary": summary or text[:200], "sentences": len(sentences)}

