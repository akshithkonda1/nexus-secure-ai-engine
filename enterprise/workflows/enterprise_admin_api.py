"""
Administrative API façade exposing enterprise operations.
"""
from __future__ import annotations

from typing import Dict

from enterprise.identity.scim.scim_server import SCIMServer
from enterprise.identity.sso.oidc_handler import OIDCHandler
from enterprise.identity.sso.saml_handler import SAMLHandler
from enterprise.encryption.byok_manager import BYOKManager
from enterprise.compliance.compliance_export import ComplianceExport
from enterprise.workflows.sla_manager import SLAManager


class EnterpriseAdminAPI:
    def __init__(
        self,
        scim_server: SCIMServer,
        oidc_handler: OIDCHandler,
        saml_handler: SAMLHandler,
        byok_manager: BYOKManager,
        sla_manager: SLAManager,
        audit_exporter: ComplianceExport,
    ):
        self.scim_server = scim_server
        self.oidc_handler = oidc_handler
        self.saml_handler = saml_handler
        self.byok_manager = byok_manager
        self.sla_manager = sla_manager
        self.audit_exporter = audit_exporter

    def create_tenant(self, tenant_id: str, key_material: bytes, provider: str) -> Dict[str, str]:
        slot = self.byok_manager.register_tenant_key(tenant_id, f"{tenant_id}-k1", key_material, provider)
        event = {"action": "tenant_created", "tenant": tenant_id}
        self.audit_exporter.add_record(event)
        return {"tenant": tenant_id, "key_id": slot.key_id}

    def directory_sync(self, payload: Dict) -> dict:
        record = self.scim_server.handle_create_user(payload)
        self.audit_exporter.add_record({"action": "directory_sync", "user": record.get("id")})
        return record

    def manage_sso(self, oidc_token: str, saml_assertion: str, audience: str, issuer: str) -> Dict[str, Dict]:
        oidc = self.oidc_handler.validate(oidc_token, audience, issuer)
        saml = self.saml_handler.validate(saml_assertion, audience)
        self.audit_exporter.add_record({"action": "sso_validation", "issuer": issuer})
        return {"oidc": oidc, "saml": saml}

    def audit_export(self) -> str:
        return self.audit_exporter.export_json()

    def configure_sla(self, tenant_id: str, policy: Dict) -> Dict:
        self.sla_manager.define_sla(tenant_id, policy)
        self.audit_exporter.add_record({"action": "sla_config", "tenant": tenant_id})
        return policy

    def manage_keys(self, tenant_id: str, key_material: bytes, provider: str) -> Dict:
        slot = self.byok_manager.rotate_key(tenant_id, f"{tenant_id}-rotated", key_material, provider)
        self.audit_exporter.add_record({"action": "key_rotation", "tenant": tenant_id})
        return {"key_id": slot.key_id, "provider": provider}
