"""Feedback submission router."""
from __future__ import annotations

import json
import uuid
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.backend.feedback_system_v2.analyzer import get_analyzer
from src.backend.feedback_system_v2.db_service import get_db_service
from src.backend.feedback_system_v2.embeddings import get_embedding_service
from src.backend.feedback_system_v2.encryption import decrypt_payload
from src.backend.feedback_system_v2.logger import write_local
from src.backend.feedback_system_v2.notifier import get_notifier
from src.backend.feedback_system_v2.pii import remove_pii

router = APIRouter()

analyzer = get_analyzer()
embedding_service = get_embedding_service()
db_service = get_db_service()
notifier = get_notifier()


class FeedbackRequest(BaseModel):
    payload: str = Field(..., description="AES-256-GCM encrypted payload")
    session_id: str | None = Field(default=None, description="Session identifier for AAD")
    strip_names: bool = Field(default=False, description="Optionally remove names from feedback")


@router.post("/feedback/submit")
def submit_feedback(request: FeedbackRequest) -> Dict[str, Any]:
    aad = request.session_id.encode("utf-8") if request.session_id else None
    decrypted = decrypt_payload(request.payload, aad=aad)
    if not decrypted:
        raise HTTPException(status_code=400, detail="Empty feedback payload")

    try:
        body = json.loads(decrypted)
        feedback_text = body.get("feedback") or body.get("message") or decrypted
    except json.JSONDecodeError:
        feedback_text = decrypted

    sanitized = remove_pii(feedback_text, strip_names=request.strip_names)
    embedding = embedding_service.generate(sanitized)
    analysis = analyzer.analyze(sanitized, session_id=request.session_id)

    record_id = str(uuid.uuid4())
    record = {
        "id": record_id,
        "feedback": sanitized,
        "analysis": {
            "summary": analysis.summary,
            "sentiment": analysis.sentiment,
            "category": analysis.category,
            "priority": analysis.priority,
        },
        "embedding": embedding,
    }

    write_local(record_id, record)
    db_service.insert_feedback(record)
    notifier.alert(record)

    return {
        "id": record_id,
        "analysis": record["analysis"],
        "embedding_dimensions": len(embedding),
    }
