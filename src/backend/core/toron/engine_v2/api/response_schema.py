"""
Toron Response Schema.
"""

from pydantic import BaseModel
from typing import Dict, List


class ToronResponseSchema(BaseModel):
    final_answer: str
    confidence: float
    model_used: str
    models_considered: List[str]
    evidence_used: Dict[str, str]
    reasoning_trace: Dict[str, any]
    session_id: str
    timestamp: str
