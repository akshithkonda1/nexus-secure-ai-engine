"""Workspace service that works without external dependencies."""
from __future__ import annotations

from typing import Dict, List, Optional

from .models import Document, Workspace
from .storage import InMemoryStore


class WorkspaceService:
    def __init__(self, store: Optional[InMemoryStore] = None):
        self.store = store or InMemoryStore()

    def create_workspace(self, workspace_id: str, metadata: Optional[Dict[str, object]] = None) -> Workspace:
        workspace = Workspace(id=workspace_id, metadata=metadata or {})
        self.store.set("workspaces", workspace_id, workspace)
        return workspace

    def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        return self.store.get("workspaces", workspace_id)

    def list_workspaces(self) -> List[Workspace]:
        return list(self.store.list_items("workspaces").values())

    def add_document(self, workspace_id: str, document_id: str, content: str, metadata: Optional[Dict[str, object]] = None) -> Document:
        doc = Document(id=document_id, workspace_id=workspace_id, content=content, metadata=metadata or {})
        self.store.set(f"documents:{workspace_id}", document_id, doc)
        return doc

    def list_documents(self, workspace_id: str) -> List[Document]:
        return list(self.store.list_items(f"documents:{workspace_id}").values())

    def get_document(self, workspace_id: str, document_id: str) -> Optional[Document]:
        return self.store.get(f"documents:{workspace_id}", document_id)
