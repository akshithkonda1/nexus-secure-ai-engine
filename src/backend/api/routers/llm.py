"""LLM routing endpoints."""
from __future__ import annotations

import json
from typing import Any, Dict, Iterable

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.backend.core.toron.engine.toron_engine import ToronEngine
from src.backend.security.aes256_engine import AES256Engine
from src.backend.security.pii_sanitizer import PiiSanitizer

router = APIRouter(prefix="/api/v1", tags=["llm"])


class AskRequest(BaseModel):
    payload: str
    stream: bool = False
    user_id: str | None = None
    context: Dict[str, Any] | None = None


def get_engine(request: Request) -> ToronEngine:
    return request.app.state.toron_engine  # type: ignore[attr-defined]


def get_crypto(request: Request) -> AES256Engine:
    return request.app.state.aes_engine  # type: ignore[attr-defined]


def get_sanitizer(request: Request) -> PiiSanitizer:
    return request.app.state.pii_sanitizer  # type: ignore[attr-defined]


def _decrypt_payload(request: AskRequest, crypto: AES256Engine) -> Dict[str, Any]:
    try:
        decrypted = crypto.decrypt(request.payload)
        parsed = json.loads(decrypted)
        if not isinstance(parsed, dict):
            raise ValueError("Decrypted payload must be a JSON object")
        return parsed
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Invalid payload: {exc}") from exc


def _sanitize_prompt(data: Dict[str, Any], sanitizer: PiiSanitizer) -> tuple[str, Dict[str, Any] | None]:
    sanitized = sanitizer.sanitize(data)
    prompt = sanitized.get("prompt") if isinstance(sanitized, dict) else None
    if not prompt or not isinstance(prompt, str):
        raise HTTPException(status_code=400, detail="Payload missing prompt")
    context = sanitized.get("context") if isinstance(sanitized, dict) else None
    context = context if isinstance(context, dict) else None
    return prompt, context


def _encrypt_response(payload: str, crypto: AES256Engine) -> Dict[str, str]:
    return {"payload": crypto.encrypt(payload)}


def _sse_payload(tokens: Iterable[str], crypto: AES256Engine):
    for token in tokens:
        yield f"data: {_encrypt_response(token, crypto)['payload']}\n\n"


@router.post("/ask")
async def ask(
    ask_request: AskRequest,
    engine: ToronEngine = Depends(get_engine),
    crypto: AES256Engine = Depends(get_crypto),
    sanitizer: PiiSanitizer = Depends(get_sanitizer),
):
    payload = _decrypt_payload(ask_request, crypto)
    prompt, context = _sanitize_prompt(payload, sanitizer)
    user_id = ask_request.user_id or payload.get("user_id") if isinstance(payload, dict) else None

    if ask_request.stream:
        tokens = engine.process(prompt, user_id=user_id, context=context, stream=True)
        return StreamingResponse(_sse_payload(tokens, crypto), media_type="text/event-stream")

    result = engine.process(prompt, user_id=user_id, context=context, stream=False)
    if isinstance(result, str):
        return _encrypt_response(result, crypto)
    joined = " ".join(result)
    return _encrypt_response(joined, crypto)


@router.get("/models")
def list_models(request: Request, engine: ToronEngine = Depends(get_engine)) -> dict:
    models = engine.router.get_models()
    return {"models": models}
