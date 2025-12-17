"""ALOE synthesis layer that humanises evidence without mutating facts."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List


@dataclass
class ALOERequest:
    facts: Iterable[str]
    tone: str = "neutral"
    detail_level: str = "concise"


class ALOESynthesiser:
    """Lightweight synthesis that keeps facts intact while improving readability."""

    def synthesise(self, request: ALOERequest) -> str:
        try:
            ordered_facts: List[str] = [fact.strip() for fact in request.facts if fact.strip()]
            if not ordered_facts:
                return "No verified facts available."
            tone = request.tone.lower()
            detail = request.detail_level.lower()
            opener = {
                "supportive": "Here's what we confirmed:",
                "urgent": "Important findings:",
                "reassuring": "Good news, here's what we validated:",
            }.get(tone, "Findings:")
            joiner = " " if detail == "concise" else "\n- "
            body = joiner.join(ordered_facts)
            if detail != "concise":
                body = "- " + body
            return f"{opener} {body}"
        except Exception:
            return " ".join(request.facts)

