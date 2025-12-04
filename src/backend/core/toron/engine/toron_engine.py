"""Legacy ToronEngine facade used by API and feedback modules.

This shim preserves the public interface expected by FastAPI routes while
the v2 orchestration stack is bootstrapped. It intentionally keeps behavior
minimal: generating deterministic decision blocks, executing them through the
existing micro-agent router, and providing lightweight reflection metadata.
"""

from __future__ import annotations

import uuid
from typing import Any, Dict, List

from src.backend.core.toron.decision_blocks import DecisionBlock, DecisionStep
from src.backend.core.toron.micro_agent_router import run_plan


class ToronEngine:
    """Lightweight static helpers for decision block flows."""

    @staticmethod
    def generate_decision_block(prompt: str) -> DecisionBlock:
        """Create a simple decision block using the provided prompt."""

        prompt_text = prompt.strip()
        plan_name = f"Plan for: {prompt_text}" if prompt_text else "Generated Plan"
        step = DecisionStep(action="search_web", params={"query": prompt_text}, index=0)
        return DecisionBlock(id=str(uuid.uuid4()), plan_name=plan_name, steps=[step])

    @staticmethod
    def execute_plan(block: DecisionBlock, user_id: str | None = None) -> List[Dict[str, Any]]:
        """Run a decision block through the micro-agent router."""

        return run_plan(block, user_id=user_id)

    @staticmethod
    def reflect_on_outputs(block: DecisionBlock, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Summarize execution outcomes for observability."""

        return {
            "plan_id": block.id,
            "plan_name": block.plan_name,
            "completed_steps": [r for r in results if r.get("status") == "completed"],
            "errors": [r for r in results if r.get("status") == "error"],
        }
