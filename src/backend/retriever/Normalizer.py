import json
import re
import unicodedata
from typing import Any, Dict, Optional


def normalize_html(text: str) -> str:
    cleaned = re.sub(r"<script[\s\S]*?</script>", " ", text, flags=re.IGNORECASE)
    cleaned = re.sub(r"<style[\s\S]*?</style>", " ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    return normalize_text(cleaned)


def normalize_pdf(data: bytes) -> str:
    try:
        from io import BytesIO

        try:
            import pdfminer.high_level  # type: ignore

            output = pdfminer.high_level.extract_text(BytesIO(data))
            return normalize_text(output)
        except Exception:
            pass

        try:
            import PyPDF2  # type: ignore

            reader = PyPDF2.PdfReader(BytesIO(data))
            content = "\n".join(page.extract_text() or "" for page in reader.pages)
            return normalize_text(content)
        except Exception:
            return ""
    except Exception:
        return ""


def normalize_json(obj: Any) -> str:
    try:
        return normalize_text(json.dumps(obj, ensure_ascii=False, sort_keys=True))
    except Exception:
        return ""


def normalize_text(text: str) -> str:
    if text is None:
        return ""
    normalized = unicodedata.normalize("NFKC", text)
    normalized = normalized.replace("\r", " ")
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip()


def detect_language(text: str) -> str:
    sample = (text or "")[:256]
    # naive heuristics to avoid external dependencies
    if not sample:
        return "unknown"
    ascii_ratio = sum(1 for c in sample if ord(c) < 128) / len(sample)
    if ascii_ratio > 0.9:
        return "en"
    latin_chars = sum(1 for c in sample if "LATIN" in unicodedata.name(c, ""))
    if latin_chars / len(sample) > 0.5:
        return "lat"
    return "unknown"


def safe_truncate(text: str, limit: int = 10000) -> str:
    if text is None:
        return ""
    if len(text) <= limit:
        return text
    return text[: limit - 3] + "..."


def to_canonical(text: str) -> str:
    norm = normalize_text(text.lower())
    return re.sub(r"[^a-z0-9]+", "-", norm).strip("-")

