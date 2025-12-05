"""
Lightweight SCIM server simulation for directory sync.
"""
from __future__ import annotations

from typing import Dict

from pydantic import BaseModel, Field

from .scim_provisioning import SCIMProvisioning


class SCIMUser(BaseModel):
    userName: str
    displayName: str | None = None
    active: bool = True
    emails: list[dict] = Field(default_factory=list)


class SCIMServer:
    def __init__(self, provisioning: SCIMProvisioning | None = None):
        self.provisioning = provisioning or SCIMProvisioning()

    def handle_create_user(self, payload: Dict) -> dict:
        user = SCIMUser(**payload)
        return self.provisioning.provision_user(user.dict())

    def handle_delete_user(self, user_id: str) -> None:
        self.provisioning.deprovision_user(user_id)

    def query_users(self) -> list[dict]:
        return self.provisioning.list_users()

    def handle_group(self, payload: Dict) -> dict:
        return self.provisioning.provision_group(payload)

    def query_groups(self) -> list[dict]:
        return self.provisioning.list_groups()
