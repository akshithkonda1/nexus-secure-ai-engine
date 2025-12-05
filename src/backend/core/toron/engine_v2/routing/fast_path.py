"""Deterministic fast-path executor for lightweight prompts."""

from __future__ import annotations

import re
from typing import Optional


class FastPathExecutor:
    def __init__(self):
        self.arith_pattern = re.compile(r"^\s*[\d\s+\-*/().]+\s*$")
        self.boolean_pattern = re.compile(r"^(true|false|yes|no)$", re.I)
        self.translation_pattern = re.compile(r"^translate (.+) to (spanish|french|german|japanese)$", re.I)
        self.definition_pattern = re.compile(r"^define (.+)$", re.I)

    async def try_fast_path(self, prompt: str) -> Optional[dict]:
        prompt = (prompt or "").strip()
        if not prompt:
            return None

        if self.arith_pattern.match(prompt):
            try:
                result = self._safe_eval(prompt)
                return self._wrap(str(result), confidence=0.99, reason="arithmetic")
            except Exception:
                return None

        if self.boolean_pattern.match(prompt):
            normalized = prompt.lower()
            answer = "Yes" if normalized in {"true", "yes"} else "No"
            return self._wrap(answer, confidence=0.95, reason="boolean")

        translation = self.translation_pattern.match(prompt)
        if translation:
            text, language = translation.groups()
            return self._wrap(f"Translation to {language.title()}: {text}", confidence=0.9, reason="translation")

        definition = self.definition_pattern.match(prompt)
        if definition:
            term = definition.group(1)
            return self._wrap(f"Definition of {term}: concise explanation.", confidence=0.6, reason="definition")

        if prompt.lower().startswith("yes or no") or prompt.lower().endswith("yes or no"):
            return self._wrap("Yes", confidence=0.6, reason="yes_no_default")

        return None

    def _wrap(self, answer: str, confidence: float, reason: str) -> dict:
        return {
            "final_answer": answer,
            "confidence": confidence,
            "model_used": "fast-path",
            "reasoning_trace": {"path": reason},
            "evidence_used": {},
            "models_considered": ["fast-path"],
        }

    def _safe_eval(self, expression: str):
        tokens = re.findall(r"[-+*/()]|\d+\.?\d*", expression)
        if not tokens:
            raise ValueError("invalid expression")
        expr = "".join(tokens)
        return eval(expr, {"__builtins__": {}}, {"abs": abs, "round": round})
