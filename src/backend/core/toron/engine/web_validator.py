"""Fact validation layer against scraped web content."""
from __future__ import annotations

import math
import re
from collections import Counter
from typing import Dict, List, Literal

from pydantic import BaseModel, field_validator

from src.backend.core.toron.engine.fact_extractor import ExtractedFact
from src.backend.core.toron.engine.web_scraper import ScrapedPage


class FactCheck(BaseModel):
    """Single fact validation result."""

    fact: ExtractedFact
    verdict: Literal["supported", "contradicted", "unknown"]
    evidence_url: str | None = None
    confidence: float

    @field_validator("confidence")
    @classmethod
    def clamp_confidence(cls, value: float) -> float:
        return max(0.0, min(1.0, round(value, 4)))


class ValidationResult(BaseModel):
    """Aggregate validation response."""

    supported: List[FactCheck]
    contradicted: List[FactCheck]
    unknown: List[FactCheck]
    web_evidence: Dict[str, str]
    confidence: float

    @field_validator("confidence")
    @classmethod
    def clamp(cls, value: float) -> float:
        return max(0.0, min(1.0, round(value, 4)))


def _tokenize(text: str) -> Counter:
    tokens = [tok.lower() for tok in re.findall(r"\b[A-Za-z0-9'-]{3,}\b", text)]
    return Counter(tokens)


def _cosine_similarity(a: Counter, b: Counter) -> float:
    common = set(a.keys()) & set(b.keys())
    numerator = sum(a[t] * b[t] for t in common)
    denom_a = math.sqrt(sum(v * v for v in a.values()))
    denom_b = math.sqrt(sum(v * v for v in b.values()))
    if denom_a == 0 or denom_b == 0:
        return 0.0
    return numerator / (denom_a * denom_b)


def _negation_present(text: str) -> bool:
    return bool(re.search(r"\bnot\b|\bno\b|\bnever\b|\bnone\b", text, flags=re.IGNORECASE))


def validate_facts(facts: List[ExtractedFact], pages: List[ScrapedPage]) -> ValidationResult:
    """Validate extracted facts against scraped web evidence."""

    supported: List[FactCheck] = []
    contradicted: List[FactCheck] = []
    unknown: List[FactCheck] = []
    evidence_map: Dict[str, str] = {page.url: page.content for page in pages if page.status == "success"}

    if not facts:
        return ValidationResult(supported=[], contradicted=[], unknown=[], web_evidence=evidence_map, confidence=0.0)

    for fact in facts:
        fact_tokens = _tokenize(fact.text)
        best_similarity = 0.0
        best_url: str | None = None
        best_content = ""

        for page in pages:
            if page.status != "success":
                continue
            page_tokens = _tokenize(page.content)
            similarity = _cosine_similarity(fact_tokens, page_tokens)
            keyword_hit = len(set(fact_tokens.keys()) & set(page_tokens.keys()))
            similarity += 0.05 * keyword_hit
            if similarity > best_similarity:
                best_similarity = similarity
                best_url = page.url
                best_content = page.content

        negated = _negation_present(best_content)
        if best_similarity >= 0.25 and not negated:
            verdict = "supported"
            confidence = min(1.0, 0.6 + best_similarity * 0.4)
        elif best_similarity >= 0.2 and negated:
            verdict = "contradicted"
            confidence = min(1.0, 0.5 + best_similarity * 0.5)
        else:
            verdict = "unknown"
            confidence = 0.35

        fact_check = FactCheck(fact=fact, verdict=verdict, evidence_url=best_url, confidence=confidence)
        if verdict == "supported":
            supported.append(fact_check)
        elif verdict == "contradicted":
            contradicted.append(fact_check)
        else:
            unknown.append(fact_check)

    aggregate_confidence = min(1.0, (len(supported) * 0.6 + len(contradicted) * 0.4) / max(len(facts), 1))
    return ValidationResult(
        supported=supported,
        contradicted=contradicted,
        unknown=unknown,
        web_evidence=evidence_map,
        confidence=aggregate_confidence,
    )
