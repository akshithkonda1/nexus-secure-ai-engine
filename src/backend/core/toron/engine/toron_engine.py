"""Primary Toron Engine implementation."""
from __future__ import annotations

import time
from typing import Dict, Generator, Iterable, List

from src.backend.core.toron.engine.debate_engine import DebateEngine
from src.backend.core.toron.engine.model_router import ModelRouter
from src.backend.core.toron.engine.orchestrator import Orchestrator
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
