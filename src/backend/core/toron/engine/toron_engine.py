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

    @staticmethod
    def generate_decision_block(user_prompt: str) -> DecisionBlock:
        """Construct a reversible, non-executing decision block."""

        prompt = user_prompt.strip()
        sentences = [segment.strip() for segment in prompt.split(".") if segment.strip()]
        steps: List[DecisionStep] = []
        for index, sentence in enumerate(sentences or [prompt]):
            action = "summarize" if index == 0 else "workspace_note"
            params = {"text": sentence} if action == "summarize" else {"note": sentence}
            steps.append(DecisionStep(action=action, params=params, index=index))

        risk = "Medium" if any(word in prompt.lower() for word in ["delete", "remove", "drop"]) else "Low"
        reversible = True

        return DecisionBlock(
            id=str(uuid4()),
            plan_name=f"Plan for: {prompt[:40]}",
            steps=steps,
            risk=risk,
            reversible=reversible,
            created_at=datetime.utcnow(),
            model_votes={"router": "toron"},
            user_instructions=prompt,
        )

    @staticmethod
    def reflect_on_outputs(plan: DecisionBlock, results: List[Dict]) -> str:
        """Summarize outcomes for human-readable delivery."""

        success_count = sum(1 for item in results if item.get("status") == "completed")
        error_count = sum(1 for item in results if item.get("status") == "error")
        safety = plan.safety_metadata()
        summary_lines = [
            f"Plan '{plan.plan_name}' executed with {success_count} success(es) and {error_count} error(s).",
            f"Risk: {safety['risk']} | Reversible: {safety['reversible']}",
        ]
        if error_count:
            errors = [item for item in results if item.get("status") == "error"]
            summary_lines.append(f"Issues: {', '.join(err.get('error', 'unknown') for err in errors)}")
        else:
            summary_lines.append("All steps completed without blocking issues.")
        return "\n".join(summary_lines)
