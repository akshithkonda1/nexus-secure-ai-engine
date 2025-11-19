from __future__ import annotations

from datetime import datetime, timedelta
from typing import List

from sqlalchemy import select

from ..config import settings
from ..database import get_session
from ..models import Project, UpcomingItem, WorkspaceDigest
from ..schemas import DigestResponse
from .zora_engine import RyuzenEngine


ENGINE = RyuzenEngine()


def _collect_workspace_activity(session, user_id: str) -> List[str]:
    items: List[str] = []
    projects = session.scalars(select(Project).where(Project.user_id == user_id)).all()
    for project in projects:
        items.append(f"Project {project.name} is {project.status} - {project.description}")
    window_start = datetime.utcnow() - timedelta(hours=24)
    upcoming = (
        session.scalars(
            select(UpcomingItem).where(UpcomingItem.user_id == user_id, UpcomingItem.due_at >= window_start)
        ).all()
    )
    for task in upcoming:
        items.append(f"Upcoming {task.title} due {task.due_at.isoformat()} ({task.category})")
    if not items:
        items.append("Quiet day across the workspace.")
    return items


def trigger_digest(user_id: str) -> DigestResponse:
    with get_session() as session:
        notes = _collect_workspace_activity(session, user_id)
        raw_summary = ENGINE.summarize("workspace-digest", {"entries": notes})
        limited = _truncate_words(raw_summary, 1000)
        digest = WorkspaceDigest(user_id=user_id, summary=limited)
        session.add(digest)
        session.flush()
        return DigestResponse(id=digest.id, summary=digest.summary, createdAt=digest.created_at)


def latest_digest(user_id: str) -> DigestResponse:
    with get_session() as session:
        row = session.scalars(
            select(WorkspaceDigest)
            .where(WorkspaceDigest.user_id == user_id)
            .order_by(WorkspaceDigest.id.desc())
            .limit(1)
        ).first()
        if not row:
            raise ValueError("No digest available")
        return DigestResponse(id=row.id, summary=row.summary, createdAt=row.created_at)


def _truncate_words(text: str, max_words: int) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    trimmed = " ".join(words[:max_words])
    return trimmed + " ..."
