"""Configuration helpers for the Toron engine."""

from dataclasses import dataclass
import os


@dataclass
class EngineConfig:
    """Runtime configuration derived from environment variables.

    Attributes:
        host: Interface the server binds to.
        port: Listening port for the Toron engine HTTP server.
        log_level: Verbosity for application logs.
        default_provider: The preferred cloud provider.
    """

    host: str = os.getenv("TORON_HOST", "0.0.0.0")
    port: int = int(os.getenv("TORON_PORT", "8080"))
    log_level: str = os.getenv("TORON_LOG_LEVEL", "INFO")
    default_provider: str = os.getenv("TORON_DEFAULT_PROVIDER", "aws")


def load_config() -> "EngineConfig":
    """Load configuration using the current environment."""

    return EngineConfig()
