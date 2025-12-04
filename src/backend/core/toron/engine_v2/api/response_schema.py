"""
Toron Response Schema — final structured output from engine
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List

class ToronResponse(BaseModel):
    final_answer: str
    models_considered: List[str]
    confidence: float
    reasoning_trace: Dict[str, Any]
    session_id: str
    timestamp: str


