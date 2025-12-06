"""Telemetry schema definitions for Ryuzen Telemetry System."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Dict, List

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class TelemetryEvent(BaseModel):
    """Represents a single telemetry event for LLM performance monitoring."""

    telemetry_version: str = Field(..., description="Telemetry schema version identifier")
    timestamp_utc: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp when the event was recorded",
    )
    model_name: str = Field(..., description="Name of the evaluated model")
    model_version: str = Field(..., description="Model version or release tag")
    category: str = Field(..., description="Evaluation category such as reasoning or factual")
    prompt_type: str = Field(..., description="Prompt style or type used for the evaluation")
    token_in: int = Field(..., ge=0, description="Number of input tokens")
    token_out: int = Field(..., ge=0, description="Number of output tokens")
    latency_ms: int = Field(..., ge=0, description="Inference latency in milliseconds")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Model confidence score")
    reasoning_depth_score: float = Field(..., ge=0.0, le=1.0, description="Depth of reasoning score")
    hallucination_flag: bool = Field(..., description="Indicates detected hallucination")
    safety_risk_flag: bool = Field(..., description="Indicates potential safety risk")
    bias_vector: List[float] = Field(..., description="Bias measurement vector")
    disagreement_vector: Dict[str, float] = Field(..., description="Disagreement metrics across evaluators")
    drift_signature: str = Field(..., description="Signature summarizing model drift observations")
    sanitized: bool = Field(
        default=False,
        description="Flag indicating sanitization state; false for raw events, true after scrubbing",
    )

    model_config = ConfigDict(extra="forbid", validate_assignment=True, strict=True)

    @field_validator("bias_vector")
    @classmethod
    def validate_bias_vector(cls, value: List[float]) -> List[float]:
        """Ensure bias vectors are not empty and contain numeric values."""

        if not value:
            raise ValueError("bias_vector must not be empty")
        if not all(isinstance(entry, (int, float)) for entry in value):
            raise ValueError("bias_vector must contain numeric values")
        return [float(entry) for entry in value]

    @field_validator("disagreement_vector")
    @classmethod
    def validate_disagreement_vector(cls, value: Dict[str, float]) -> Dict[str, float]:
        """Ensure disagreement vector contains numeric values."""

        if not value:
            raise ValueError("disagreement_vector must not be empty")
        coerced = {}
        for key, val in value.items():
            if not isinstance(val, (int, float)):
                raise ValueError(f"disagreement_vector value for '{key}' must be numeric")
            coerced[key] = float(val)
        return coerced


def create_event(**data: object) -> TelemetryEvent:
    """Create a validated :class:`TelemetryEvent` instance with clean errors.

    Args:
        **data: Keyword arguments corresponding to :class:`TelemetryEvent` fields.

    Returns:
        TelemetryEvent: A validated telemetry event instance.

    Raises:
        ValueError: If validation fails, a simplified error message is raised.
    """

    try:
        event = TelemetryEvent(**data)
        logger.debug("TelemetryEvent created: %s", event.model_dump())
        return event
    except ValidationError as exc:  # pragma: no cover - defensive
        error_messages = json.dumps(exc.errors(), indent=2)
        logger.error("TelemetryEvent validation failed: %s", error_messages)
        raise ValueError(f"Invalid telemetry event data: {error_messages}") from exc


__all__ = ["TelemetryEvent", "create_event"]
