from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(slots=True, frozen=True)
class AppConfig:
    """Runtime configuration for the Zora Command Center backend."""

    database_url: str = os.getenv("ZORA_DB_URL", "sqlite:///./zora_command_center.db")
    default_user_id: str = os.getenv("ZORA_DEFAULT_USER", "user-0001")
    telemetry_sample_rate: float = float(os.getenv("ZORA_TELEMETRY_SAMPLE_RATE", "1.0"))


settings = AppConfig()
