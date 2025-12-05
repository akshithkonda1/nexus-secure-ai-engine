from __future__ import annotations

import ipaddress
import logging
from dataclasses import dataclass, field
from typing import Iterable, List, Optional

from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)


class RegionLockConfig(BaseModel):
    allowed_regions: List[str] = Field(default_factory=list)
    trusted_cidrs: List[str] = Field(default_factory=list)

    def validate_region(self, region: str) -> None:
        if self.allowed_regions and region not in self.allowed_regions:
            raise RegionLockViolation(f"Region {region} is not permitted. Allowed: {self.allowed_regions}")

    def validate_cidr(self, client_ip: str) -> None:
        if not self.trusted_cidrs:
            return
        ip_addr = ipaddress.ip_address(client_ip)
        for cidr in self.trusted_cidrs:
            if ip_addr in ipaddress.ip_network(cidr, strict=False):
                return
        raise RegionLockViolation(f"Client IP {client_ip} is outside trusted CIDRs: {self.trusted_cidrs}")


class RegionLockViolation(RuntimeError):
    """Raised when a region or network boundary is violated."""


@dataclass
class RegionLocker:
    config: RegionLockConfig = field(default_factory=RegionLockConfig)

    @classmethod
    def from_settings(cls, allowed_regions: Iterable[str], trusted_cidrs: Optional[Iterable[str]] = None) -> "RegionLocker":
        try:
            cfg = RegionLockConfig(allowed_regions=list(allowed_regions), trusted_cidrs=list(trusted_cidrs or []))
        except ValidationError as exc:
            raise RegionLockViolation(f"Invalid region lock configuration: {exc}") from exc
        return cls(config=cfg)

    def ensure_region_allowed(self, region: str, client_ip: Optional[str] = None) -> None:
        logger.debug("Validating region %s against %s", region, self.config.allowed_regions)
        self.config.validate_region(region)
        if client_ip:
            logger.debug("Validating client IP %s against CIDRs %s", client_ip, self.config.trusted_cidrs)
            self.config.validate_cidr(client_ip)

    def enforce_data_residency(self, data_region: str) -> None:
        logger.debug("Enforcing data residency for region %s", data_region)
        self.config.validate_region(data_region)

    def isolate_cache_namespace(self, base_namespace: str, region: str) -> str:
        self.config.validate_region(region)
        isolated = f"{base_namespace}::{region}"
        logger.debug("Isolated cache namespace: %s", isolated)
        return isolated

    def serialize(self) -> dict:
        return self.config.model_dump()
