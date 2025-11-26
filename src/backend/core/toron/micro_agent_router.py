"""Router for executing micro-agents in a controlled manner."""
from __future__ import annotations

from typing import Any, Dict, List

from src.backend.core.toron.decision_blocks import DecisionBlock, DecisionStep
from src.backend.core.toron.micro_agents import (
    extract_agent,
    fetch_file_agent,
    rewrite_agent,
    search_web_agent,
    summarize_agent,
    translate_agent,
    workspace_note_agent,
    workspace_write_agent,
)
from src.backend.core.workspace.workspace_logger import log_operation


ACTION_MAP = {
    "fetch_file": fetch_file_agent.run,
    "summarize": summarize_agent.run,
    "rewrite": rewrite_agent.run,
    "extract": extract_agent.run,
    "translate": translate_agent.run,
    "search_web": search_web_agent.run,
    "workspace_write": workspace_write_agent.run,
    "workspace_note": workspace_note_agent.run,
}


def run_step(step: DecisionStep, plan_id: str = "unknown", user_id: str | None = None) -> Dict[str, Any]:
    if step.action not in ACTION_MAP:
        raise ValueError(f"Unsupported action: {step.action}")

    runner = ACTION_MAP[step.action]
    result = runner(**step.params)
    log_operation(
        session_id=step.params.get("session_id", "session-unknown"),
        plan_id=plan_id,
        user_id=user_id,
        details={"action": step.action, "index": step.index, "result": result},
    )
    return {"status": "completed", "action": step.action, "index": step.index, "result": result}


def run_plan(block: DecisionBlock, user_id: str | None = None) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    for step in block.steps:
        try:
            step_result = run_step(step, plan_id=block.id, user_id=user_id)
            results.append(step_result)
        except Exception as exc:  # noqa: BLE001
            results.append({"status": "error", "action": step.action, "index": step.index, "error": str(exc)})
            break
    return results

