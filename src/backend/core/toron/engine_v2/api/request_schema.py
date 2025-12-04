"""
Toron Request Schema — validated input format.
"""

from pydantic import BaseModel
from typing import Optional


class ToronRequest(BaseModel):
    prompt: str
    tier: str = "free"
    allow_web: bool = True
    allow_memory: bool = True
    allow_storage: bool = True

    user_id: Optional[str] = "anonymous"
    session_id: Optional[str] = None
