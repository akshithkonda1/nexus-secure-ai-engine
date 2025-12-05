"""
SCIM provisioning helpers for users and groups.
"""
from __future__ import annotations

import uuid
from typing import Dict, List


class SCIMProvisioning:
    def __init__(self):
        self.users: Dict[str, dict] = {}
        self.groups: Dict[str, dict] = {}

    def provision_user(self, user: dict) -> dict:
        user_id = user.get("id") or str(uuid.uuid4())
        resource = {"id": user_id, **user}
        self.users[user_id] = resource
        return resource

    def deprovision_user(self, user_id: str) -> None:
        self.users.pop(user_id, None)

    def list_users(self) -> List[dict]:
        return list(self.users.values())

    def provision_group(self, group: dict) -> dict:
        group_id = group.get("id") or str(uuid.uuid4())
        resource = {"id": group_id, **group}
        self.groups[group_id] = resource
        return resource

    def list_groups(self) -> List[dict]:
        return list(self.groups.values())
