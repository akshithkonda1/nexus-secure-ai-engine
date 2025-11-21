"""Unified connectors orchestration."""
from __future__ import annotations

import threading
from typing import Dict, List


class ConnectorsUnified:
    """Keeps track of connector states and synchronization."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._states: Dict[str, str] = {
            "github": "disconnected",
            "google_drive": "disconnected",
            "outlook": "disconnected",
        }

    def get_all_states(self) -> Dict[str, str]:
        """Return all connector states."""

        with self._lock:
            return dict(self._states)

    def sync_all(self) -> Dict[str, str]:
        """Trigger a sync for every connector and return the updated states."""

        with self._lock:
            for name in self._states:
                self._states[name] = "synced"
            return dict(self._states)

    def update_state(self, name: str, state: str) -> None:
        with self._lock:
            self._states[name] = state
