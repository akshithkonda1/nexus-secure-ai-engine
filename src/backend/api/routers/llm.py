"""LLM-facing API routes for the Ryuzen Toron v1.6 Engine."""
from __future__ import annotations

import asyncio
import json
from typing import Any, AsyncGenerator, Dict, List

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, StreamingResponse

from src.backend.audit.EncryptedAuditTrail import EncryptedAuditTrail
from src.backend.enterprise.TenantIsolation import EnterpriseTenantIsolation
from src.backend.routing.MultiCloudFailoverRouter import MultiCloudFailoverRouter
from src.backend.safety.SafetyOrchestrator import SafetyOrchestrator, SafetyOutcome
from src.backend.utils.IDGenerator import trace_id

router = APIRouter(prefix="/api/v1", tags=["llm"])


tenant_isolation = EnterpriseTenantIsolation()
failover_router = MultiCloudFailoverRouter()
audit_trail = EncryptedAuditTrail()
safety_orchestrator = SafetyOrchestrator(
    router=failover_router,
    audit_trail=audit_trail,
    tenant_isolation=tenant_isolation,
)


class ToronEngine:
    """Placeholder Toron engine façade for synchronous and streaming calls."""

    @staticmethod
    def process(payload: Dict[str, Any]) -> Dict[str, Any]:
        prompt = str(payload.get("prompt", "")).strip()
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")

        response_text = f"Echo: {prompt[:2048]}"
        return {"result": response_text, "meta": {"length": len(response_text)}}

    @staticmethod
    async def stream(payload: Dict[str, Any]) -> AsyncGenerator[str, None]:
        response = ToronEngine.process(payload)
        text = response.get("result", "")
        for token in text.split():
            await asyncio.sleep(0.01)
            yield token


class ModelRouter:
    """Provides a snapshot of available model providers and models."""

    @staticmethod
    def list() -> List[Dict[str, Any]]:
        return [
            {"provider": "toron", "models": ["rt-v1.6-base", "rt-v1.6-instruct"]},
            {"provider": "openai", "models": ["gpt-4o-mini", "gpt-4o"]},
        ]


def decrypt_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    # TODO: integrate KMS/HSM-backed decryption
    return payload


def sanitize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    sanitized = {k: v for k, v in payload.items() if k.lower() != "pii"}
    prompt = sanitized.get("prompt")
    if isinstance(prompt, str):
        sanitized["prompt"] = prompt.replace("\n", " ").strip()
    return sanitized


def encrypt_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    # TODO: integrate client-specific encryption
    return payload


def run_safety_layer(payload: Dict[str, Any]) -> SafetyOutcome:
    tenant_id = str(payload.get("tenant_id", "public"))
    anchors = payload.get("context_anchors") or []
    preferred = payload.get("preferred_providers") or None
    outcome = safety_orchestrator.run(
        prompt=str(payload.get("prompt", "")),
        tenant_id=tenant_id,
        context_anchors=anchors if isinstance(anchors, list) else [],
        preferred_providers=preferred if isinstance(preferred, list) else None,
    )
    return outcome


def enrich_with_safety_metadata(response: Dict[str, Any], outcome: SafetyOutcome) -> Dict[str, Any]:
    meta = response.setdefault("meta", {})
    meta.update(
        {
            "provider": outcome.routing.provider,
            "safe_mode": outcome.safe_mode,
            "risk_score": outcome.risk.value,
            "drift_score": outcome.drift.drift_score,
            "reasoning_budget": outcome.reasoning_budget,
            "trace_id": trace_id(),
        }
    )
    return response


@router.post("/ask")
async def ask(payload: Dict[str, Any]) -> JSONResponse:
    decrypted = decrypt_payload(payload)
    sanitized = sanitize_payload(decrypted)
    outcome = run_safety_layer(sanitized)
    sanitized["prompt"] = outcome.sanitized_prompt if not outcome.safe_mode else f"[STRICT_SAFE] {outcome.sanitized_prompt}"
    sanitized["provider"] = outcome.routing.provider
    result = ToronEngine.process(sanitized)
    enriched = enrich_with_safety_metadata(result, outcome)
    encrypted = encrypt_payload(enriched)
    return JSONResponse(content=encrypted)


@router.get("/models")
async def models() -> JSONResponse:
    return JSONResponse(content=ModelRouter.list())


@router.get("/stream")
async def stream(prompt: str) -> StreamingResponse:
    decrypted = decrypt_payload({"prompt": prompt})
    sanitized = sanitize_payload(decrypted)
    outcome = run_safety_layer(sanitized)
    sanitized["prompt"] = outcome.sanitized_prompt if not outcome.safe_mode else f"[STRICT_SAFE] {outcome.sanitized_prompt}"
    sanitized["provider"] = outcome.routing.provider

    async def event_source() -> AsyncGenerator[bytes, None]:
        async for token in ToronEngine.stream(sanitized):
            data = json.dumps({"delta": token, "provider": outcome.routing.provider})
            yield f"data: {data}\n\n".encode()
        yield b"data: {\"done\": true}\n\n"

    return StreamingResponse(event_source(), media_type="text/event-stream")


@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        initial = await websocket.receive_json()
        decrypted = decrypt_payload(initial)
        sanitized = sanitize_payload(decrypted)
        outcome = run_safety_layer(sanitized)
        sanitized["prompt"] = outcome.sanitized_prompt if not outcome.safe_mode else f"[STRICT_SAFE] {outcome.sanitized_prompt}"
        sanitized["provider"] = outcome.routing.provider

        async for token in ToronEngine.stream(sanitized):
            await websocket.send_json({"delta": token, "provider": outcome.routing.provider})
        await websocket.send_json({"done": True, "provider": outcome.routing.provider})
    except WebSocketDisconnect:
        return
    except Exception as exc:  # noqa: BLE001
        await websocket.send_json({"error": str(exc), "type": "stream_error", "details": {}})
        await websocket.close()

