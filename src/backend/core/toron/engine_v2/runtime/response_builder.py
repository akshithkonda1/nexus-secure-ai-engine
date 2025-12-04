"""
Response Builder — constructs ToronResponse payload.
"""

import time
from pydantic import BaseModel


class ToronResponse(BaseModel):
    final_answer: str
    confidence: float
    model_used: str
    models_considered: list
    reasoning_trace: dict
    evidence_used: dict
    session_id: str
    timestamp: str


class ResponseBuilder:
    def build(self, result, context):
        return ToronResponse(
            final_answer=result["final_answer"],
            confidence=result["confidence"],
            model_used=result["model_used"],
            models_considered=result["models_considered"],
            reasoning_trace=result["reasoning_trace"],
            evidence_used=result["evidence_used"],
            session_id=context.get("session_id", "none"),
            timestamp=str(time.time())
        ).model_dump()
