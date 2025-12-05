"""
Permission engine supporting hierarchical RBAC and ABAC conditions.
"""
from __future__ import annotations

import fnmatch
import yaml
from typing import Dict, List


class PermissionEngine:
    def __init__(self, policy_path: str):
        with open(policy_path, "r", encoding="utf-8") as f:
            self.policies = yaml.safe_load(f)["policies"]

    def evaluate(self, action: str, resource: str, context: Dict[str, object]) -> bool:
        decisions: List[bool] = []
        for policy in self.policies:
            if not self._action_matches(policy["actions"], action):
                continue
            if not self._resource_matches(policy["resources"], resource):
                continue
            if not self._condition_satisfied(policy.get("condition", {}), context):
                continue
            decisions.append(policy["effect"] == "allow")
        if not decisions:
            return False
        if any(decision is False for decision in decisions):
            return False
        return any(decisions)

    def _action_matches(self, actions: List[str], action: str) -> bool:
        return any(fnmatch.fnmatch(action, pattern) for pattern in actions)

    def _resource_matches(self, resources: List[str], resource: str) -> bool:
        return any(fnmatch.fnmatch(resource, pattern) for pattern in resources)

    def _condition_satisfied(self, condition: Dict, context: Dict[str, object]) -> bool:
        if not condition:
            return True
        attribute = condition.get("attribute")
        equals = condition.get("equals")
        return context.get(attribute) == equals
