"""Session-aware Toron chat endpoints."""
from __future__ import annotations

from datetime import datetime
from threading import Lock
from typing import Any, Dict, List, MutableMapping, Optional
import uuid

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1/toron", tags=["toron-sessions"])


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


class InMemoryToronSessionStore:
    """Simple in-memory storage for Toron sessions."""

    def __init__(self) -> None:
        self._sessions: MutableMapping[str, Dict[str, Any]] = {}
        self._lock = Lock()

    def list_sessions(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [self._session_summary(session) for session in self._sessions.values()]

    def create_session(self, title: str) -> Dict[str, Any]:
        now = _now_iso()
        session_id = str(uuid.uuid4())
        session = {
            "session_id": session_id,
            "title": title,
            "messages": [],
            "created_at": now,
            "updated_at": now,
        }
        with self._lock:
            self._sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return None
            # return a shallow copy to avoid mutation from callers
            return {
                "session_id": session["session_id"],
                "title": session.get("title") or "Untitled",
                "messages": list(session.get("messages", [])),
                "created_at": session.get("created_at"),
                "updated_at": session.get("updated_at"),
            }

    def update_session(self, session_id: str, **updates: Any) -> Optional[Dict[str, Any]]:
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return None
            session.update(updates)
            session["updated_at"] = _now_iso()
            return self.get_session(session_id)

    def delete_session(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)

    def append_messages(self, session_id: str, messages: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return None
            session.setdefault("messages", []).extend(messages)
            session["updated_at"] = _now_iso()
            return self.get_session(session_id)

    @staticmethod
    def _session_summary(session: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "session_id": session.get("session_id"),
            "title": session.get("title") or "Untitled",
            "created_at": session.get("created_at"),
            "updated_at": session.get("updated_at"),
        }


toron_session_store = InMemoryToronSessionStore()


@router.get("/sessions")
async def list_sessions() -> Dict[str, Any]:
    """List all Toron sessions."""
    sessions = toron_session_store.list_sessions()
    return {"sessions": sessions}


@router.post("/sessions", status_code=201)
async def create_session(payload: Dict[str, Any]) -> Dict[str, Any]:
    title = str(payload.get("title") or "New Toron Session").strip()[:200]
    session = toron_session_store.create_session(title)
    return session


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> Dict[str, Any]:
    session = toron_session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="session_not_found")
    return session


@router.patch("/sessions/{session_id}")
async def update_session_meta(session_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    updates: Dict[str, Any] = {}
    title = payload.get("title")
    if isinstance(title, str):
        updates["title"] = title.strip()[:200]

    updated = toron_session_store.update_session(session_id, **updates) if updates else toron_session_store.get_session(session_id)
    if not updated:
        raise HTTPException(status_code=404, detail="session_not_found")
    return updated


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str) -> Dict[str, bool]:
    toron_session_store.delete_session(session_id)
    return {"ok": True}


@router.post("/chat")
async def toron_chat(payload: Dict[str, Any]) -> Dict[str, Any]:
    session_id = payload.get("session_id")
    user_message = str(payload.get("message") or "").strip()

    if not user_message:
        raise HTTPException(status_code=400, detail="empty_message")
    if not session_id:
        raise HTTPException(status_code=400, detail="missing_session_id")

    session = toron_session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="session_not_found")

    now = _now_iso()
    user_entry = {
        "id": str(uuid.uuid4()),
        "sender": "user",
        "text": user_message,
        "timestamp": now,
    }

    toron_reply_text = f"Toron received: \"{user_message}\""
    assistant_entry = {
        "id": str(uuid.uuid4()),
        "sender": "toron",
        "text": toron_reply_text,
        "timestamp": _now_iso(),
    }

    toron_session_store.append_messages(session_id, [user_entry, assistant_entry])

    return {"session_id": session_id, "messages": [user_entry, assistant_entry]}


__all__ = ["router", "toron_session_store", "InMemoryToronSessionStore"]
