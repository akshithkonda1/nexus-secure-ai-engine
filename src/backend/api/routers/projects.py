from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import engine, get_session
from ..schemas import MessageCreate, Project, ProjectCreate, ProjectUpdate, Thread, ThreadCreate
from ..storage import (
    append_message,
    create_project,
    create_thread,
    delete_project,
    ensure_tables,
    get_project,
    get_thread_context,
    list_projects,
    list_threads,
    update_project,
)

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

ensure_tables(engine)


@router.post("", response_model=Project)
def create_project_route(payload: ProjectCreate, session: Session = Depends(get_session)) -> Project:
    return create_project(session, payload.name)


@router.get("", response_model=list[Project])
def list_projects_route(session: Session = Depends(get_session)) -> list[Project]:
    return list_projects(session)


@router.get("/{project_id}", response_model=Project)
def get_project_route(project_id: str, session: Session = Depends(get_session)) -> Project:
    project = get_project(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=Project)
def update_project_route(project_id: str, payload: ProjectUpdate, session: Session = Depends(get_session)) -> Project:
    project = update_project(session, project_id, payload.name)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}")
def delete_project_route(project_id: str, session: Session = Depends(get_session)) -> dict:
    delete_project(session, project_id)
    return {"status": "deleted"}


@router.post("/{project_id}/threads", response_model=Thread)
def create_thread_route(project_id: str, payload: ThreadCreate, session: Session = Depends(get_session)) -> Thread:
    thread = create_thread(session, project_id, payload.title)
    if not thread:
        raise HTTPException(status_code=404, detail="Project not found")
    return thread


@router.get("/{project_id}/threads", response_model=list[Thread])
def list_threads_route(project_id: str, session: Session = Depends(get_session)) -> list[Thread]:
    return list_threads(session, project_id)


@router.post("/{project_id}/threads/{thread_id}/messages")
def append_message_route(
    project_id: str, thread_id: str, payload: MessageCreate, session: Session = Depends(get_session)
):
    message = append_message(session, project_id, thread_id, payload.role, payload.content, payload.timestamp)
    if not message:
        raise HTTPException(status_code=404, detail="Project or thread not found")
    return message


@router.get("/{project_id}/threads/{thread_id}/context")
def thread_context_route(project_id: str, thread_id: str, session: Session = Depends(get_session)):
    thread = get_thread_context(session, project_id, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return {"context": thread.messages}
