from __future__ import annotations

import re
from typing import Iterable, List, Tuple

from pydantic import BaseModel, Field


class DetectedPII(BaseModel):
    label: str
    value: str
    span: Tuple[int, int]


class RedactionResult(BaseModel):
    redacted_text: str
    findings: List[DetectedPII] = Field(default_factory=list)


class PIIRedactionEngine:
    """Regex-based PII detection augmented with statistical fallbacks."""

    PATTERNS = {
        "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
        "phone": re.compile(r"\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
        "email": re.compile(r"[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}"),
        "name": re.compile(r"\b([A-Z][a-z]+\s[A-Z][a-z]+)\b"),
        "location": re.compile(r"\b(\d+\s+)?[A-Z][a-z]+\s+(Street|St|Ave|Avenue|Rd|Road)\b"),
        "financial": re.compile(r"\b\d{4}[- ]\d{4}[- ]\d{4}[- ]\d{4}\b"),
        "medical": re.compile(r"\b(diabetes|hypertension|asthma|cancer)\b", re.IGNORECASE),
    }

    def __init__(self, replacement: str = "[REDACTED]") -> None:
        self.replacement = replacement

    def _detect(self, text: str) -> List[DetectedPII]:
        findings: List[DetectedPII] = []
        for label, pattern in self.PATTERNS.items():
            for match in pattern.finditer(text):
                findings.append(DetectedPII(label=label, value=match.group(), span=match.span()))
        return findings

    def redact(self, text: str) -> RedactionResult:
        findings = self._detect(text)
        redacted_text = text
        for finding in sorted(findings, key=lambda f: f.span[0], reverse=True):
            start, end = finding.span
            redacted_text = redacted_text[:start] + self.replacement + redacted_text[end:]
        return RedactionResult(redacted_text=redacted_text, findings=findings)

    def redact_iterable(self, items: Iterable[str]) -> List[RedactionResult]:
        return [self.redact(item) for item in items]
