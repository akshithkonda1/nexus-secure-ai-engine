"""Query optimizer and classification for routing decisions."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Dict


@dataclass
class OptimizationResult:
    prompt: str
    intent: str
    complexity: str
    tokens: int
    preferred_models: List[str]


class QueryOptimizer:
    """
    Heuristic query optimizer that normalizes prompts, classifies
    complexity, and proposes provider/model selections.
    """

    def __init__(self):
        self.fast_intents = {
            "math": re.compile(r"^[-+*/0-9 ().]+$"),
            "translation": re.compile(r"translate|in (spanish|french|german|japanese)", re.I),
            "definition": re.compile(r"^what is|define|meaning of", re.I),
        }

    def optimize(self, request: Dict) -> OptimizationResult:
        prompt = (request.get("prompt") or "").strip()
        tokens = len(prompt.split())
        intent = self._classify_intent(prompt)
        complexity = "high" if tokens > 400 else "medium" if tokens > 120 else "low"
        preferred_models = self._preferred_models(intent, complexity)
        return OptimizationResult(prompt, intent, complexity, tokens, preferred_models)

    def _classify_intent(self, prompt: str) -> str:
        for intent, pattern in self.fast_intents.items():
            if pattern.search(prompt):
                return intent
        if "http" in prompt or "www" in prompt:
            return "web"
        if len(prompt.split()) > 300:
            return "longform"
        return "general"

    def _preferred_models(self, intent: str, complexity: str) -> List[str]:
        if intent == "math":
            return ["gpt-4o-mini"]
        if intent == "translation":
            return ["gpt-4o-mini", "claude-3-haiku"]
        if intent == "definition":
            return ["gpt-4o-mini"]
        if complexity == "high":
            return ["gpt-4o", "claude-3-opus"]
        if complexity == "medium":
            return ["gpt-4o-mini", "gemini-pro"]
        return ["gpt-4o-mini"]

    def select_models(self, request: Dict, available: List[str]) -> List[str]:
        optimized = self.optimize(request)
        for candidate in optimized.preferred_models:
            if candidate in available:
                return [candidate]
        return available[:2] if available else ["gpt-4o-mini"]

    def classify(self, request: Dict) -> Dict:
        optimized = self.optimize(request)
        return {
            "intent": optimized.intent,
            "complexity": optimized.complexity,
            "tokens": optimized.tokens,
            "preferred_models": optimized.preferred_models,
        }
