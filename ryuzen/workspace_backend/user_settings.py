"""Simple in-memory user settings backend."""
from __future__ import annotations

from typing import Any, Dict


class UserSettingsBackend:
    """Stores per-user settings in a deterministic dictionary."""

    def __init__(self) -> None:
        self._settings: Dict[str, Dict[str, Any]] = {}

    def get_settings(self, user_id: str) -> Dict[str, Any]:
        return dict(self._settings.get(user_id, {}))

    def update_settings(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        current = self._settings.setdefault(user_id, {})
        current.update(updates)
        return dict(current)

    def reset_settings(self, user_id: str) -> None:
        self._settings.pop(user_id, None)
