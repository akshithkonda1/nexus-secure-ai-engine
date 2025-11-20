"""Normalization helpers to canonicalize text and whitespace."""
from __future__ import annotations

import unicodedata
from typing import Optional


def normalize_whitespace(text: str) -> str:
    return " ".join(text.split())


def normalize_unicode(text: str) -> str:
    return unicodedata.normalize("NFKC", text)


def safe_trim(text: Optional[str]) -> str:
    return text.strip() if text else ""


def canonicalize_spacing(text: str) -> str:
    normalized = normalize_unicode(text)
    return " ".join(normalized.split())


__all__ = [
    "normalize_whitespace",
    "normalize_unicode",
    "safe_trim",
    "canonicalize_spacing",
]
