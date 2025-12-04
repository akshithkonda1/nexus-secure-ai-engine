"""Deterministic fact extraction utilities for Toron."""
from __future__ import annotations

import re
from collections import Counter
from typing import Dict, Iterable, List

from pydantic import BaseModel, field_validator


class ExtractedFact(BaseModel):
    """Structured fact derived from model output."""

    text: str
    source_model: str
    confidence: float

    @field_validator("confidence")
    @classmethod
    def validate_confidence(cls, value: float) -> float:
        if not 0.0 <= value <= 1.0:
            raise ValueError("confidence must be between 0 and 1")
        return round(value, 4)

    @field_validator("text")
    @classmethod
    def clean_text(cls, value: str) -> str:
        cleaned = re.sub(r"\s+", " ", value).strip()
        return cleaned[:500]


def _split_sentences(text: str) -> Iterable[str]:
    return [segment for segment in re.split(r"(?<=[.!?])\s+", text) if segment]


def _keyword_density(text: str) -> Counter:
    tokens = [tok.lower() for tok in re.findall(r"\b[A-Za-z0-9'-]{3,}\b", text)]
    stopwords = {
        "the",
        "and",
        "for",
        "with",
        "that",
        "have",
        "this",
        "from",
        "were",
        "which",
    }
    filtered = [t for t in tokens if t not in stopwords]
    return Counter(filtered)


def extract_facts(model_outputs: Dict[str, str]) -> List[ExtractedFact]:
    """Extract up to ten high-confidence facts from multiple model outputs."""

    facts: List[ExtractedFact] = []
    for model_name in sorted(model_outputs.keys()):
        text = model_outputs[model_name]
        sentences = _split_sentences(text)
        keyword_counts = _keyword_density(text)
        total_tokens = sum(keyword_counts.values()) or 1

        for sentence in sentences:
            patterns = re.findall(r"\b\d{4}\b|\b\d+[.,]?\d*\b|\b[A-Z][a-z]{2,}\b", sentence)
            density_score = sum(keyword_counts.get(tok.lower(), 0) for tok in _keyword_density(sentence))
            positional = 1 - (len(facts) / 20)
            confidence = min(1.0, 0.5 + (density_score / total_tokens) + (0.05 * len(patterns)) + positional * 0.1)
            facts.append(ExtractedFact(text=sentence, source_model=model_name, confidence=confidence))
            if len(facts) >= 10:
                return facts
    return facts
