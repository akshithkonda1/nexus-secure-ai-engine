"""Ryuzen engine surface area - Production ready."""

# Primary engine (v2.5h+ Enhanced with real AI providers)
from .toron_v25hplus import (
    ToronEngineV31Enhanced,
    EngineConfig,
    DEFAULT_CONFIG,
    ConsensusQuality,
    OutputGrade,
    ArbitrationSource,
)

# Supporting modules
from .cache import InMemoryCache
from .consensus import ConsensusIntegrator
from .telemetry_client import TelemetryClient, get_telemetry_client
from .health import check_engine_loaded, health_metadata
from .simulation_mode import SimulationMode

__all__ = [
    # Main engine
    "ToronEngineV31Enhanced",
    "EngineConfig",
    "DEFAULT_CONFIG",

    # Enums
    "ConsensusQuality",
    "OutputGrade",
    "ArbitrationSource",

    # Supporting classes
    "InMemoryCache",
    "ConsensusIntegrator",
    "TelemetryClient",
    "get_telemetry_client",

    # Utilities
    "check_engine_loaded",
    "health_metadata",
    "SimulationMode",
]
