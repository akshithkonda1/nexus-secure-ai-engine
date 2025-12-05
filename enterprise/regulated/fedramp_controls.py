from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Dict, List

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class FedRampControl(BaseModel):
    control_id: str
    description: str
    implemented: bool = True


@dataclass
class FedRampControls:
    allowed_models: List[str] = field(default_factory=list)
    allowed_regions: List[str] = field(default_factory=list)
    controls: List[FedRampControl] = field(default_factory=list)

    @classmethod
    def default(cls) -> "FedRampControls":
        base_controls = [
            FedRampControl(control_id="AC-2", description="Account management"),
            FedRampControl(control_id="AU-2", description="Audit events"),
            FedRampControl(control_id="SC-7", description="Boundary protection"),
            FedRampControl(control_id="SC-13", description="Cryptographic protection"),
        ]
        return cls(allowed_models=[], allowed_regions=[], controls=base_controls)

    def to_mapping(self) -> Dict[str, object]:
        mapping = {
            "access_control": [c.model_dump() for c in self.controls if c.control_id.startswith("AC")],
            "audit": [c.model_dump() for c in self.controls if c.control_id.startswith("AU")],
            "system_protection": [c.model_dump() for c in self.controls if c.control_id.startswith("SC")],
            "allowed_models": self.allowed_models,
            "allowed_regions": self.allowed_regions,
        }
        logger.debug("FedRAMP mapping produced with %d controls", len(self.controls))
        return mapping

    def export_json(self) -> str:
        return json.dumps(self.to_mapping(), indent=2)

    def verify_provider(self, provider: str) -> bool:
        approved = any(provider.startswith(prefix) for prefix in ("bedrock.gov", "azure-il", "private-endpoint"))
        if not approved:
            logger.warning("Provider %s does not satisfy FedRAMP profile", provider)
        return approved
