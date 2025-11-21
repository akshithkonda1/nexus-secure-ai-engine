from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SanitizedMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str
    timestamp: datetime


class Thread(BaseModel):
    id: str
    title: str
    messages: List[SanitizedMessage] = Field(default_factory=list)


class Project(BaseModel):
    id: str
    name: str
    createdAt: datetime
    threads: List[Thread] = Field(default_factory=list)


class ProjectCreate(BaseModel):
    name: str


class ProjectUpdate(BaseModel):
    name: str


class ThreadCreate(BaseModel):
    title: str


class MessageCreate(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None


class ProjectContext(BaseModel):
    context: List[SanitizedMessage]


class AskPayload(BaseModel):
    prompt: str
    projectContext: Optional[ProjectContext] = None
    projectId: Optional[str] = None
    threadId: Optional[str] = None
