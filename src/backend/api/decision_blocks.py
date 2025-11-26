"""API routes for human-approved Toron decision blocks."""
from __future__ import annotations

from typing import Dict

from fastapi import APIRouter, HTTPException

from src.backend.core.toron.decision_blocks import DecisionBlock
from src.backend.core.toron.engine.toron_engine import ToronEngine
from src.backend.core.toron.micro_agent_router import run_plan

router = APIRouter(prefix="/api/v1/toron", tags=["toron_decision_blocks"])

IN_MEMORY_PLANS: Dict[str, DecisionBlock] = {}


@router.post("/plan")
async def plan(payload: Dict[str, str]) -> Dict:
    prompt = payload.get("user_prompt", "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="user_prompt is required")

    block = ToronEngine.generate_decision_block(prompt)
    IN_MEMORY_PLANS[block.id] = block
    return block.serialize()


@router.post("/plan/approve")
async def approve(payload: Dict[str, str]) -> Dict:
    block_id = payload.get("decision_block_id")
    if not block_id:
        raise HTTPException(status_code=400, detail="decision_block_id is required")
    block = IN_MEMORY_PLANS.get(block_id)
    if not block:
        raise HTTPException(status_code=404, detail="Decision block not found")

    results = run_plan(block)
    reflection = ToronEngine.reflect_on_outputs(block, results)
    return {"plan": block.serialize(), "results": results, "reflection": reflection}


@router.post("/plan/reject")
async def reject(payload: Dict[str, str]) -> Dict:
    block_id = payload.get("decision_block_id")
    if not block_id:
        raise HTTPException(status_code=400, detail="decision_block_id is required")
    block = IN_MEMORY_PLANS.pop(block_id, None)
    if not block:
        raise HTTPException(status_code=404, detail="Decision block not found")
    return {"rejected": True, "plan_id": block_id}

