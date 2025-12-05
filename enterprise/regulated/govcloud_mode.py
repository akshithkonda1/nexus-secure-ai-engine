from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from .fedramp_controls import FedRampControls
from .region_locking import RegionLocker, RegionLockViolation

logger = logging.getLogger(__name__)


@dataclass
class GovCloudEnforcer:
    allowed_regions: List[str]
    allowed_models: List[str]
    zero_retention: bool = False
    fedramp_controls: FedRampControls = field(default_factory=FedRampControls.default)
    region_locker: RegionLocker | None = None

    def __post_init__(self) -> None:
        self.region_locker = self.region_locker or RegionLocker.from_settings(self.allowed_regions)
        if not self.allowed_models:
            self.allowed_models = self.fedramp_controls.allowed_models or ["bedrock.gov"]
        logger.debug("GovCloudEnforcer initialized with regions %s and models %s", self.allowed_regions, self.allowed_models)

    def enforce_request(self, request: Dict[str, object]) -> Dict[str, object]:
        region = str(request.get("region", ""))
        model = str(request.get("model", ""))
        client_ip = request.get("client_ip")
        if not model:
            raise ValueError("Model is required for GovCloud enforcement")
        self._validate_region(region, client_ip)
        self._validate_model(model)
        request = self._apply_zero_retention(request)
        request = self._enforce_no_external_api(request)
        logger.info("GovCloud request enforced for model %s in region %s", model, region)
        return request

    def enforce_response(self, response: Dict[str, object]) -> Dict[str, object]:
        if self.zero_retention:
            response.pop("logs", None)
            response.pop("memory", None)
            response["ephemeral"] = True
            logger.debug("Zero-retention mode stripped logs and memory")
        response["fedramp"] = self.fedramp_controls.to_mapping()
        return response

    def _validate_region(self, region: str, client_ip: Optional[str]) -> None:
        try:
            self.region_locker.ensure_region_allowed(region, client_ip)
        except RegionLockViolation as exc:
            raise PermissionError(str(exc)) from exc

    def _validate_model(self, model: str) -> None:
        allowlisted = any(model.startswith(prefix) for prefix in self.allowed_models)
        if not allowlisted:
            raise PermissionError(f"Model {model} is not approved for GovCloud usage")
        if not self.fedramp_controls.verify_provider(model):
            raise PermissionError(f"Model provider {model} failed FedRAMP verification")

    def _apply_zero_retention(self, request: Dict[str, object]) -> Dict[str, object]:
        if self.zero_retention:
            for key in ("logs", "memory", "lineage"):
                request.pop(key, None)
            request["ephemeral"] = True
            logger.debug("Zero-retention enforced on request")
        return request

    def _enforce_no_external_api(self, request: Dict[str, object]) -> Dict[str, object]:
        request["external_api_allowed"] = False
        return request

    @staticmethod
    def derive_fips_key(secret: bytes, salt: bytes) -> bytes:
        kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=100000)
        return kdf.derive(secret)
