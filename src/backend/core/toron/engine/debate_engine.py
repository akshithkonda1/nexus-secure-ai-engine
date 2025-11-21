"""Lightweight debate mechanism to improve answers."""
from __future__ import annotations

from typing import List


class DebateEngine:
    """Runs a multi-model debate loop."""

    def __init__(self, reviewers: int = 2) -> None:
        self.reviewers = reviewers

    def run_debate(self, prompt: str, model: dict, context: dict | None = None) -> List[str]:
        """Produce a list of candidate responses to later aggregate."""

        base = context.get("system", "Toron") if context else "Toron"
        preamble = f"{base} using {model.get('name', 'model')}"
        transcripts = [f"{preamble} reviewer {idx+1}: {prompt}" for idx in range(self.reviewers)]
        transcripts.append(f"{preamble} consensus: {prompt} (refined)")
        return transcripts
