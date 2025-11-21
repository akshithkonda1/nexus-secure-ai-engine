"""HTTP retrieval helpers used for tests and demo flows."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol


class SessionProtocol(Protocol):
    """Minimal protocol for an HTTP session used in tests."""

    def get(self, url: str, timeout: int = 5) -> Any:  # pragma: no cover - protocol definition
        ...


@dataclass
class Retriever:
    """Fetch content from remote endpoints with dependency-injected sessions."""

    session: SessionProtocol

    def fetch_json(self, url: str) -> dict:
        response = self.session.get(url, timeout=5)
        if getattr(response, "status_code", 500) >= 400:
            raise RuntimeError(f"Upstream error {response.status_code}")
        if hasattr(response, "json"):
            return response.json()
        raise ValueError("Response does not contain JSON content")

    def fetch_text(self, url: str) -> str:
        response = self.session.get(url, timeout=5)
        if getattr(response, "status_code", 500) >= 400:
            raise RuntimeError(f"Upstream error {response.status_code}")
        if hasattr(response, "text"):
            return response.text
        raise ValueError("Response missing text attribute")
