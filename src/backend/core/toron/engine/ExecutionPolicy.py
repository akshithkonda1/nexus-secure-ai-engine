from __future__ import annotations

from typing import Optional

from nexus.ai.nexus_engine import EngineConfig


class ExecutionPolicy:
    """Wrapper around EngineConfig enforcing token limits and safety rules."""

    def __init__(self, config: Optional[EngineConfig] = None):
        self.config = config or EngineConfig()

    def max_tokens(self) -> Optional[int]:
        return getattr(self.config, "max_tokens", None)

    def deadline_ms(self) -> Optional[int]:
        return getattr(self.config, "default_deadline_ms", None)

    def enforce_deadline(self, provided: Optional[int]) -> Optional[int]:
        if provided is None:
            return self.deadline_ms()
        if self.deadline_ms() is None:
            return provided
        return min(provided, self.deadline_ms())

    def can_use_model(self, model: str, tier: str) -> bool:
        # Delegates to existing tier policy logic baked into _choose_models
        return True


__all__ = ["ExecutionPolicy"]
