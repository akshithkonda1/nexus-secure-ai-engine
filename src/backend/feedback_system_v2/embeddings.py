"""Wrapper around ToronEngine.embed for feedback embeddings."""
from __future__ import annotations

import hashlib
from typing import List

try:  # Optional import for environments without full Toron pipeline
    from src.backend.core.toron.engine.toron_engine import ToronEngine
except Exception:  # pragma: no cover - fallback for limited environments
    ToronEngine = None  # type: ignore[misc]


class EmbeddingService:
    """Generate embeddings using ToronEngine when available."""

    def __init__(self, engine: ToronEngine | None = None) -> None:  # type: ignore[name-defined]
        self.engine = engine

    def generate(self, text: str) -> List[float]:
        if self.engine and hasattr(self.engine, "embed"):
            try:
                return list(self.engine.embed(text))  # type: ignore[call-arg]
            except Exception:
                pass
        # Deterministic lightweight embedding fallback
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        return [int.from_bytes(digest[i : i + 4], "big") / 1_000_000 for i in range(0, len(digest), 4)]


def get_embedding_service(engine: ToronEngine | None = None) -> EmbeddingService:  # type: ignore[name-defined]
    return EmbeddingService(engine)
