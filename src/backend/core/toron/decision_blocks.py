"""Decision block schema and utilities for Toron orchestration."""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, validator


class DecisionStep(BaseModel):
    """Represents a single reversible action request."""

    action: str
    params: Dict
    index: int

    @validator("action")
    def validate_action(cls, value: str) -> str:  # noqa: D417
        if not value or not value.strip():
            raise ValueError("action must be provided")
        return value.strip()

    @validator("index")
    def validate_index(cls, value: int) -> int:  # noqa: D417
        if value < 0:
            raise ValueError("index must be non-negative")
        return value


class DecisionBlock(BaseModel):
    """Immutable description of what Toron intends to do."""

    id: str
    plan_name: str
    steps: List[DecisionStep]
    risk: str = "Low"
    reversible: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    model_votes: Dict = Field(default_factory=dict)
    user_instructions: Optional[str] = None

    @validator("id")
    def validate_id(cls, value: str) -> str:  # noqa: D417
        if not value or not value.strip():
            raise ValueError("id must be provided")
        return value

    @validator("plan_name")
    def validate_plan_name(cls, value: str) -> str:  # noqa: D417
        if not value or not value.strip():
            raise ValueError("plan_name must be provided")
        return value.strip()

    @validator("steps")
    def validate_steps(cls, value: List[DecisionStep]) -> List[DecisionStep]:  # noqa: D417
        if not value:
            raise ValueError("at least one step is required")
        indexes = [step.index for step in value]
        if len(indexes) != len(set(indexes)):
            raise ValueError("step indexes must be unique")
        return sorted(value, key=lambda step: step.index)

    def serialize(self) -> Dict:
        """Return a JSON-safe representation."""

        return self.model_dump()

    def diff(self, other: "DecisionBlock") -> Dict[str, Dict]:
        """Return a structural diff between two blocks."""

        changes: Dict[str, Dict] = {}
        for field_name in self.model_fields:
            current = getattr(self, field_name)
            previous = getattr(other, field_name, None)
            if current != previous:
                changes[field_name] = {"from": previous, "to": current}
        return changes

    def safety_metadata(self) -> Dict[str, str | bool | datetime]:
        """Expose only safety-relevant metadata."""

        return {
            "risk": self.risk,
            "reversible": self.reversible,
            "created_at": self.created_at,
        }

