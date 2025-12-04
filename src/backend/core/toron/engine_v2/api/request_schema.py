"""
Toron Request Schemas — validated via Pydantic v2
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class ToronRequest(BaseModel):
    prompt: str = Field(...)
    tier: str = Field(default="free")

    allow_web: bool = True
    allow_memory: bool = False
    allow_storage: bool = False

    user_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Optional[Dict] = None

    max_tokens: Optional[int] = 3000
    temperature: float = 0.7
    

