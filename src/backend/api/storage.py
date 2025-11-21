from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import MessageRecord, ProjectRecord, ThreadRecord
from .schemas import Project, SanitizedMessage, Thread
from .security import get_cipher, sanitize_text

cipher = get_cipher()


def _generate_id() -> str:
    return uuid.uuid4().hex


def _encrypt_text(value: str) -> str:
    return cipher.encrypt(sanitize_text(value))


def _decrypt_text(value: str) -> str:
    try:
        return sanitize_text(cipher.decrypt(value))
    except Exception:
        return sanitize_text(value)


def ensure_tables(engine) -> None:
    from .database import Base

    Base.metadata.create_all(bind=engine)


def project_to_schema(project: ProjectRecord, threads: List[ThreadRecord], messages: List[MessageRecord]) -> Project:
    thread_map: dict[str, Thread] = {}
    for thread in threads:
        msgs = [m for m in messages if m.thread_id == thread.id]
        thread_map[thread.id] = Thread(
            id=thread.id,
            title=_decrypt_text(thread.title),
            messages=[
                SanitizedMessage(
                    role=m.role if m.role == "assistant" else "user",
                    content=sanitize_text(cipher.decrypt(m.content_encrypted)),
                    timestamp=m.timestamp,
                )
                for m in msgs
            ],
        )
    return Project(
        id=project.id,
        name=_decrypt_text(project.name),
        createdAt=project.created_at,
        threads=list(thread_map.values()),
    )


def list_projects(session: Session) -> List[Project]:
    projects = session.scalars(select(ProjectRecord)).all()
    all_threads = session.scalars(select(ThreadRecord)).all()
    all_messages = session.scalars(select(MessageRecord)).all()
    threads_by_project: dict[str, List[ThreadRecord]] = {}
    for thread in all_threads:
        threads_by_project.setdefault(thread.project_id, []).append(thread)
    grouped_messages: List[MessageRecord] = list(all_messages)
    result: List[Project] = []
    for project in projects:
        threads = threads_by_project.get(project.id, [])
        result.append(project_to_schema(project, threads, grouped_messages))
    return result


def create_project(session: Session, name: str) -> Project:
    record = ProjectRecord(id=_generate_id(), name=_encrypt_text(name), created_at=datetime.utcnow())
    session.add(record)
    session.flush()
    return project_to_schema(record, [], [])


def update_project(session: Session, project_id: str, name: str) -> Optional[Project]:
    project = session.get(ProjectRecord, project_id)
    if not project:
        return None
    project.name = _encrypt_text(name)
    session.add(project)
    session.flush()
    threads = session.scalars(select(ThreadRecord).where(ThreadRecord.project_id == project_id)).all()
    messages = session.scalars(
        select(MessageRecord).where(MessageRecord.thread_id.in_([t.id for t in threads] or [""]))
    ).all()
    return project_to_schema(project, threads, messages)


def delete_project(session: Session, project_id: str) -> None:
    session.query(MessageRecord).filter(MessageRecord.thread_id.in_(
        select(ThreadRecord.id).where(ThreadRecord.project_id == project_id)
    )).delete(synchronize_session=False)
    session.query(ThreadRecord).filter(ThreadRecord.project_id == project_id).delete(synchronize_session=False)
    session.query(ProjectRecord).filter(ProjectRecord.id == project_id).delete(synchronize_session=False)


def get_project(session: Session, project_id: str) -> Optional[Project]:
    project = session.get(ProjectRecord, project_id)
    if not project:
        return None
    threads = session.scalars(select(ThreadRecord).where(ThreadRecord.project_id == project_id)).all()
    messages = session.scalars(
        select(MessageRecord).where(MessageRecord.thread_id.in_([t.id for t in threads] or [""]))
    ).all()
    return project_to_schema(project, threads, messages)


def create_thread(session: Session, project_id: str, title: str) -> Optional[Thread]:
    if not session.get(ProjectRecord, project_id):
        return None
    record = ThreadRecord(id=_generate_id(), project_id=project_id, title=_encrypt_text(title))
    session.add(record)
    session.flush()
    return Thread(id=record.id, title=_decrypt_text(record.title), messages=[])


def list_threads(session: Session, project_id: str) -> List[Thread]:
    threads = session.scalars(select(ThreadRecord).where(ThreadRecord.project_id == project_id)).all()
    thread_ids = [t.id for t in threads]
    messages = session.scalars(select(MessageRecord).where(MessageRecord.thread_id.in_(thread_ids or [""]))).all()
    return [
        Thread(
            id=thread.id,
            title=_decrypt_text(thread.title),
            messages=[
                SanitizedMessage(
                    role=m.role if m.role == "assistant" else "user",
                    content=sanitize_text(cipher.decrypt(m.content_encrypted)),
                    timestamp=m.timestamp,
                )
                for m in messages
                if m.thread_id == thread.id
            ],
        )
        for thread in threads
    ]


def append_message(
    session: Session, project_id: str, thread_id: str, role: str, content: str, timestamp: Optional[datetime]
) -> Optional[SanitizedMessage]:
    if not session.get(ProjectRecord, project_id) or not session.get(ThreadRecord, thread_id):
        return None
    sanitized_content = sanitize_text(content)
    message = MessageRecord(
        id=_generate_id(),
        thread_id=thread_id,
        role="assistant" if role == "assistant" else "user",
        content_encrypted=cipher.encrypt(sanitized_content),
        timestamp=timestamp or datetime.utcnow(),
    )
    session.add(message)
    session.flush()
    return SanitizedMessage(
        role=message.role,
        content=sanitized_content,
        timestamp=message.timestamp,
    )


def get_thread_context(session: Session, project_id: str, thread_id: str) -> Optional[Thread]:
    if not session.get(ProjectRecord, project_id):
        return None
    thread = session.get(ThreadRecord, thread_id)
    if not thread:
        return None
    messages = session.scalars(select(MessageRecord).where(MessageRecord.thread_id == thread_id)).all()
    return Thread(
        id=thread.id,
        title=_decrypt_text(thread.title),
        messages=[
            SanitizedMessage(
                role=m.role if m.role == "assistant" else "user",
                content=sanitize_text(cipher.decrypt(m.content_encrypted)),
                timestamp=m.timestamp,
            )
            for m in messages
        ],
    )
