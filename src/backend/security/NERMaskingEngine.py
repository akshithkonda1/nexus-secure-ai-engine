"""NER masking engine using spaCy when available."""
from __future__ import annotations

from typing import Dict, List

try:  # pragma: no cover - optional dependency
    import spacy
    _NLP = spacy.load("en_core_web_sm")
except Exception:  # pragma: no cover - fallback
    _NLP = None


ENTITY_TOKENS = {
    "PERSON": "[REDACTED_PERSON]",
    "ORG": "[REDACTED_ORG]",
    "GPE": "[REDACTED_GPE]",
    "LOC": "[REDACTED_LOC]",
    "DATE": "[REDACTED_DATE]",
    "NORP": "[REDACTED_NORP]",
    "FAC": "[REDACTED_FAC]",
}


class NERMaskingEngine:
    def __init__(self) -> None:
        self.nlp = _NLP

    def mask(self, text: str) -> str:
        if not text:
            return text
        if self.nlp is None:
            return self._heuristic_mask(text)
        doc = self.nlp(text)
        masked_text = text
        for ent in reversed(doc.ents):
            token = ENTITY_TOKENS.get(ent.label_, "[REDACTED]")
            start, end = ent.start_char, ent.end_char
            masked_text = masked_text[:start] + token + masked_text[end:]
        return masked_text

    def _heuristic_mask(self, text: str) -> str:
        words = text.split()
        masked: List[str] = []
        for word in words:
            if word.istitle() and len(word) > 2:
                masked.append(ENTITY_TOKENS["PERSON"])
            else:
                masked.append(word)
        return " ".join(masked)


__all__ = ["NERMaskingEngine", "ENTITY_TOKENS"]
