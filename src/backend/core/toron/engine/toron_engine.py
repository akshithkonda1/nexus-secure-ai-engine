"""Primary Toron Engine implementation."""
from __future__ import annotations

import time
from datetime import datetime
from typing import Dict, Generator, Iterable, List
from uuid import uuid4

from src.backend.core.toron.engine.debate_engine import DebateEngine
from src.backend.core.toron.engine.model_router import ModelRouter
from src.backend.core.toron.engine.orchestrator import Orchestrator
from src.backend.core.toron.decision_blocks import DecisionBlock, DecisionStep
from src.backend.core.toron.micro_agent_router import run_plan
from src.backend.rate_limit.concurrency_gate import ConcurrencyGate
from src.backend.rate_limit.global_rate_limiter import GlobalRateLimiter
from src.backend.rate_limit.user_rate_limiter import UserRateLimiter


class ToronEngine:
    """Production-safe orchestration layer for Toron."""

    def __init__(
        self,
        router: ModelRouter,
        orchestrator: Orchestrator,
        debate_engine: DebateEngine,
        global_rate_limiter: GlobalRateLimiter,
        user_rate_limiter: UserRateLimiter,
        concurrency_gate: ConcurrencyGate,
    ) -> None:
        self.router = router
        self.orchestrator = orchestrator
        self.debate_engine = debate_engine
        self.global_rate_limiter = global_rate_limiter
        self.user_rate_limiter = user_rate_limiter
        self.concurrency_gate = concurrency_gate

    def process(
        self, prompt: str, user_id: str | None = None, context: Dict[str, str] | None = None, stream: bool = False
    ) -> str | Iterable[str]:
        """Run the full orchestration pipeline."""

        self.global_rate_limiter.check()
        self.user_rate_limiter.check(user_id or "anonymous")

        with self.concurrency_gate.track():
            plan = self.orchestrator.plan(prompt, context)
            model = self.router.select_model(plan)
            transcript = self.debate_engine.run_debate(prompt, model, context)
            result = self.orchestrator.finalize_response(prompt, model, transcript)

        if stream:
            return self._stream_response(result)
        return result

    def stream_tokens(self, text: str) -> Generator[str, None, None]:
        """Yield tokens for SSE/WebSocket streaming."""

        for chunk in text.split():
            time.sleep(0.01)
            yield chunk

    def _stream_response(self, text: str) -> Generator[str, None, None]:
        for token in self.stream_tokens(text):
            yield token

    def warmup(self) -> None:
        """Warm-up hook for infrastructure readiness probes."""

        self.global_rate_limiter.reset()
        self.user_rate_limiter.reset()

    def generate_web_access_plan(self, url: str, reason: str) -> Dict[str, object]:
        """Produce a reversible DecisionBlock for sandboxed web extraction."""

        return {
            "plan_name": "Extract Web Data",
            "steps": [
                {"action": "web_fetch", "params": {"url": url}},
                {"action": "web_extract", "params": {}},
            ],
            "reversible": True,
            "risk": "Low",
            "reason": reason,
        }

    def reflect_web_data(self, block: Dict[str, object], extracted_json: Dict[str, object]) -> Dict[str, object]:
        """Reflect on extraction results versus planned actions."""

        headings = extracted_json.get("headings", []) if isinstance(extracted_json, dict) else []
        paragraphs = extracted_json.get("paragraphs", []) if isinstance(extracted_json, dict) else []
        tables = extracted_json.get("tables", []) if isinstance(extracted_json, dict) else []
        links = extracted_json.get("links", []) if isinstance(extracted_json, dict) else []

        summary = {
            "summary": f"Captured {len(headings)} headings, {len(paragraphs)} paragraphs, {len(tables)} tables, and {len(links)} links.",
            "plan_reference": block,
            "accuracy_boost": "context_enriched" if paragraphs else "neutral",
        }

        return summary
