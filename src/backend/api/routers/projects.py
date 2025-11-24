"""Project container endpoints for sanitized Toron context."""
from __future__ import annotations

import re
import time
from typing import Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

REDACTION = "[sanitized]"


def sanitize_text(value: str, limit: int = 280) -> str:
    """Strip PII and ensure short, sanitized strings."""
    normalized = re.sub(r"\s+", " ", value or "").strip()
    if not normalized:
        return ""
    scrubbed = re.sub(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", REDACTION, normalized, flags=re.IGNORECASE)
    scrubbed = re.sub(r"\+?\d[\d\s().-]{8,}\d", REDACTION, scrubbed)
    scrubbed = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", REDACTION, scrubbed)
    scrubbed = re.sub(r"\b(?:\d[ -]*?){13,16}\b", REDACTION, scrubbed)
    return scrubbed[:limit]


def sanitize_score(value: float | int | None) -> float:
    if value is None:
        return 0.0
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, min(1.0, number))


class ProjectTask(BaseModel):
    id: str
    text: str
    done: bool = False

    @classmethod
    def sanitize(cls, payload: "ProjectTask") -> "ProjectTask":
        return cls(id=str(payload.id), text=sanitize_text(payload.text), done=bool(payload.done))


class ProjectContextState(BaseModel):
    persona: str = "toron-ops"
    reasoningHints: List[str] = Field(default_factory=list)
    continuityScore: float = 0.0
    difficultyScore: float = 0.0
    topicTags: List[str] = Field(default_factory=list)

    @classmethod
    def sanitize(cls, payload: "ProjectContextState") -> "ProjectContextState":
        return cls(
            persona=sanitize_text(payload.persona),
            reasoningHints=[sanitize_text(hint) for hint in payload.reasoningHints if sanitize_text(hint)],
            continuityScore=sanitize_score(payload.continuityScore),
            difficultyScore=sanitize_score(payload.difficultyScore),
            topicTags=[sanitize_text(tag) for tag in payload.topicTags if sanitize_text(tag)],
        )


class ProjectConnectors(BaseModel):
    github: bool = False
    googleDrive: bool = False
    quizlet: bool = False


class ProjectModel(BaseModel):
    id: str
    name: str
    createdAt: int
    updatedAt: int
    summary: str = ""
    semanticGraph: List[List[float]] = Field(default_factory=list)
    taskList: List[ProjectTask] = Field(default_factory=list)
    connectorsEnabled: ProjectConnectors = Field(default_factory=ProjectConnectors)
    contextState: ProjectContextState = Field(default_factory=ProjectContextState)
    version: int = 1

    @classmethod
    def sanitize(cls, payload: "ProjectModel", *, bump_version: bool = False) -> "ProjectModel":
        now_ms = int(time.time() * 1000)
        version = (payload.version or 0) + (1 if bump_version else 0)
        return cls(
            id=str(payload.id),
            name=sanitize_text(payload.name or "Untitled project"),
            createdAt=payload.createdAt or now_ms,
            updatedAt=now_ms,
            summary=sanitize_text(payload.summary or ""),
            semanticGraph=[
                [float(node) if isinstance(node, (int, float)) else 0.0 for node in row]
                for row in payload.semanticGraph
            ]
            if payload.semanticGraph
            else [],
            taskList=[ProjectTask.sanitize(task) for task in payload.taskList],
            connectorsEnabled=ProjectConnectors(**(payload.connectorsEnabled or {})),
            contextState=ProjectContextState.sanitize(payload.contextState),
            version=version or 1,
        )


class ProjectCreateRequest(BaseModel):
    name: str


class ProjectUpdateRequest(BaseModel):
    id: str
    name: str | None = None
    summary: str | None = None
    semanticGraph: List[List[float]] | None = None
    taskList: List[ProjectTask] | None = None
    connectorsEnabled: ProjectConnectors | None = None
    contextState: ProjectContextState | None = None


class ProjectDeleteRequest(BaseModel):
    id: str


PROJECT_STORE: Dict[str, ProjectModel] = {}


def upsert_project(project: ProjectModel) -> ProjectModel:
    PROJECT_STORE[project.id] = project
    return project


def ensure_project(project_id: str) -> ProjectModel:
    if project_id not in PROJECT_STORE:
        raise HTTPException(status_code=404, detail="Project not found")
    return PROJECT_STORE[project_id]


@router.post("/create")
async def create_project(body: ProjectCreateRequest) -> ProjectModel:
    now_ms = int(time.time() * 1000)
    raw = ProjectModel(
        id=str(len(PROJECT_STORE) + 1),
        name=body.name,
        createdAt=now_ms,
        updatedAt=now_ms,
        summary="",
        semanticGraph=[],
        taskList=[],
        connectorsEnabled=ProjectConnectors(),
        contextState=ProjectContextState(),
        version=1,
    )
    project = ProjectModel.sanitize(raw)
    return upsert_project(project)


@router.post("/update")
async def update_project(body: ProjectUpdateRequest) -> ProjectModel:
    existing = ensure_project(body.id)
    payload = ProjectModel(
        id=existing.id,
        name=body.name or existing.name,
        createdAt=existing.createdAt,
        updatedAt=int(time.time() * 1000),
        summary=body.summary or existing.summary,
        semanticGraph=body.semanticGraph or existing.semanticGraph,
        taskList=body.taskList or existing.taskList,
        connectorsEnabled=body.connectorsEnabled or existing.connectorsEnabled,
        contextState=body.contextState or existing.contextState,
        version=existing.version,
    )
    project = ProjectModel.sanitize(payload, bump_version=True)
    return upsert_project(project)


@router.post("/delete")
async def delete_project(body: ProjectDeleteRequest) -> Dict[str, str]:
    ensure_project(body.id)
    PROJECT_STORE.pop(body.id, None)
    return {"status": "deleted"}


@router.get("/list")
async def list_projects() -> Dict[str, List[ProjectModel]]:
    return {"projects": list(PROJECT_STORE.values())}


@router.get("/{project_id}/context")
async def project_context(project_id: str) -> Dict[str, ProjectContextState]:
    project = ensure_project(project_id)
    return {"contextState": project.contextState}

