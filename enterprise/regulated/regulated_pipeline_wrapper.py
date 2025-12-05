from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict

import yaml

from .cjis_audit_trail import CJISAuditTrail
from .govcloud_mode import GovCloudEnforcer
from .hipaa_data_guard import HIPAADataGuard
from .pii_redaction_engine import PIIRedactionEngine
from .secure_boundary_manager import SecureBoundaryManager

logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).parent / "regulated_config.yaml"


def _load_config() -> Dict[str, object]:
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Missing regulated config at {CONFIG_PATH}")
    with CONFIG_PATH.open("r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    return data.get("enterprise", {}).get("regulated", {})


def _build_enforcers(config: Dict[str, object]):
    mode = str(config.get("mode", "none"))
    allowed_regions = config.get("allowed_regions", [])
    model_allowlist = config.get("model_allowlist", [])
    zero_retention = bool(config.get("zero_retention", False))
    pii_scrubbing = bool(config.get("pii_scrubbing", True))

    govcloud = GovCloudEnforcer(allowed_regions=allowed_regions, allowed_models=model_allowlist, zero_retention=zero_retention)
    pii_engine = PIIRedactionEngine() if pii_scrubbing else None
    hipaa_guard = HIPAADataGuard.with_random_key(pii_engine=pii_engine) if mode == "hipaa" else None
    boundary_manager = SecureBoundaryManager()
    audit_trail = CJISAuditTrail()

    return mode, govcloud, hipaa_guard, boundary_manager, audit_trail


def enforce_regulated_rules(request: Dict[str, object], response: Dict[str, object]) -> Dict[str, object]:
    config = _load_config()
    mode, govcloud, hipaa_guard, boundary_manager, audit_trail = _build_enforcers(config)

    if mode == "none":
        logger.debug("Regulated mode is disabled; returning response unchanged")
        return response

    client_tenant = str(request.get("tenant", ""))
    if client_tenant:
        boundary_manager.register_boundary(client_tenant, request.get("boundary_token", ""))
        boundary_manager.isolate_context(client_tenant, {"request_id": request.get("id", "")})

    enforced_request = govcloud.enforce_request(request)
    audit_trail.log(actor=str(request.get("actor", "unknown")), category="request", action=mode, resource=str(request.get("resource", "")))

    if hipaa_guard:
        enforced_request = hipaa_guard.guard_request(enforced_request)

    processed_response = {**response}
    if hipaa_guard and "nonce" in enforced_request:
        processed_response = hipaa_guard.guard_response(processed_response, enforced_request["nonce"])

    processed_response = govcloud.enforce_response(processed_response)
    processed_response["audit"] = audit_trail.export_attested_chain()
    processed_response["regulated_mode"] = mode
    logger.info("Regulated pipeline completed for mode %s", mode)
    return processed_response
