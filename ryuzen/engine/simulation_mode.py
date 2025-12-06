"""Simulation mode toggle for Toron.

Provides a simple enable/disable flag that can be checked anywhere in the
engine to decide whether to rely on simulated providers instead of external
backends.
"""
from __future__ import annotations

import os
from typing import ClassVar, Optional


class SimulationMode:
    """Simple global toggle for simulation behavior."""

    _enabled: ClassVar[bool] = os.getenv("SIMULATION_MODE", "").lower() == "true"
    _mock_data: ClassVar[Optional[str]] = None

    @classmethod
    def enable(cls) -> None:
        """Enable simulation mode."""
        cls._enabled = True

    @classmethod
    def disable(cls) -> None:
        """Disable simulation mode."""
        cls._enabled = False

    @classmethod
    def configure_from_env(cls) -> None:
        """Align the toggle with the SIMULATION_MODE environment variable."""
        cls._enabled = os.getenv("SIMULATION_MODE", "").lower() == "true"
        cls._mock_data = os.getenv("SIMULATION_MOCK_DATA") or cls._mock_data

    @classmethod
    def is_enabled(cls) -> bool:
        """Return whether simulation mode is currently enabled."""
        return bool(cls._enabled)

    @classmethod
    def get_mock_payload(cls) -> str:
        """Return mock payload configuration, defaulting to an empty JSON object string."""
        if cls._mock_data is None:
            return "{}"
        return cls._mock_data
