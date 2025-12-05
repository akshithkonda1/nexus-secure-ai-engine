"""Simple workspace models."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class Workspace:
    id: str
    metadata: Dict[str, object] = field(default_factory=dict)


@dataclass
class Document:
    id: str
    workspace_id: str
    content: str
    metadata: Dict[str, object] = field(default_factory=dict)
