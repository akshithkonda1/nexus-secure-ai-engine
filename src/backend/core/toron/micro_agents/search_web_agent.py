"""Micro-agent placeholder for safe web search results."""
from __future__ import annotations

from typing import Any, Dict, List


def run(query: str) -> Dict[str, Any]:
    # Deterministic offline search placeholder
    results: List[Dict[str, str]] = [
        {"title": "Search unavailable in offline mode", "url": "", "snippet": query[:160]},
    ]
    return {"query": query, "results": results}

