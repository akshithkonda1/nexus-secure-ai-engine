"""Simulation mode toggle for Toron.

Provides a simple enable/disable flag that can be checked anywhere in the
engine to decide whether to rely on simulated providers instead of external
backends.
"""
from __future__ import annotations

import os
from typing import ClassVar


class SimulationMode:
    """Simple global toggle for simulation behavior."""

    _enabled: ClassVar[bool] = os.getenv("SIMULATION_MODE", "").lower() == "true"

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

    @classmethod
    def is_enabled(cls) -> bool:
        """Return whether simulation mode is currently enabled."""
        return cls._enabled
