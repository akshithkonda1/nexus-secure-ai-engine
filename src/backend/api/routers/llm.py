from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import engine, get_session
from ..schemas import AskPayload
from ..security import get_cipher, sanitize_messages, sanitize_text
from ..storage import append_message, ensure_tables

router = APIRouter(prefix="/api/v1", tags=["llm"])

ensure_tables(engine)
cipher = get_cipher()


class ToronEngine:
    """Lightweight wrapper placeholder for Toron processing."""

    def process(self, messages: List[dict]) -> str:
        combined = " \n".join(
            message.get("content", "") for message in messages if isinstance(message, dict)
        )
        return combined.strip() or "Acknowledged"


toron_engine = ToronEngine()


@router.post("/ask")
def ask(payload: AskPayload, session: Session = Depends(get_session)):
    try:
        prompt_plain = cipher.decrypt(payload.prompt)
    except Exception:
        prompt_plain = payload.prompt

    sanitized_prompt = sanitize_text(prompt_plain)
    sanitized_context = sanitize_messages(payload.projectContext.context) if payload.projectContext else []

    merged_messages = [
        *sanitized_context,
        {
            "role": "user",
            "content": sanitized_prompt,
            "timestamp": datetime.utcnow(),
        },
    ]

    response_text = sanitize_text(toron_engine.process(merged_messages))
    encrypted_response = cipher.encrypt(response_text)

    if payload.projectId and payload.threadId:
        append_message(
            session,
            payload.projectId,
            payload.threadId,
            "assistant",
            response_text,
            datetime.utcnow(),
        )

    return {"answer": encrypted_response, "sanitized": response_text}
