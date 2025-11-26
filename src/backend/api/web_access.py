"""Scoped web access endpoints for consented, read-only extraction."""
from __future__ import annotations

import json
import tempfile
import uuid
from datetime import datetime
from typing import Any, Dict
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import AnyHttpUrl, BaseModel, Field

from src.backend.core.toron.micro_agents import web_extract_agent, web_fetch_agent
from src.backend.core.toron.web_history import get_history

router = APIRouter(prefix="/api/v1/web", tags=["web-access"])


class PrepareRequest(BaseModel):
    url: AnyHttpUrl
    reason: str = Field(..., max_length=500)


class PrepareResponse(BaseModel):
    page_title: str
    url: AnyHttpUrl
    justification: str
    data_scope: str = Field(default="read-only extraction")
    risk: str = Field(default="low")
    session_id: str


class ApproveRequest(BaseModel):
    url: AnyHttpUrl
    session_id: str
    allow_once: bool = False


class ApproveResponse(BaseModel):
    extracted: Dict[str, Any]
    timestamp: str
    session_id: str


@router.post("/prepare", response_model=PrepareResponse)
async def prepare_web_access(payload: PrepareRequest) -> PrepareResponse:
    parsed = urlparse(str(payload.url))
    page_title = parsed.hostname or "webpage"
    session_id = uuid.uuid4().hex
    justification = payload.reason.strip() or "User requested web extraction."

    return PrepareResponse(
        page_title=page_title,
        url=str(payload.url),
        justification=justification,
        data_scope="read-only extraction",
        risk="low",
        session_id=session_id,
    )


@router.post("/approve", response_model=ApproveResponse)
async def approve_web_access(payload: ApproveRequest) -> ApproveResponse:
    try:
        html = await run_in_threadpool(web_fetch_agent.run_web_fetch, str(payload.url))
        extracted = await run_in_threadpool(web_extract_agent.run_web_extract, html)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    history = get_history()
    history.log_extraction(
        session_id=payload.session_id,
        url=str(payload.url),
        extracted_data=extracted,
        user_approval_id="allow_once" if payload.allow_once else "allow_session",
    )

    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as handle:
        json.dump({"session_id": payload.session_id, "extracted": extracted}, handle, indent=2)

    timestamp = datetime.utcnow().isoformat() + "Z"
    return ApproveResponse(extracted=extracted, timestamp=timestamp, session_id=payload.session_id)
