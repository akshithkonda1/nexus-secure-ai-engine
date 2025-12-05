"""
Enterprise notifications across Slack, Teams and email.
"""
from __future__ import annotations

from typing import Dict, List


class EnterpriseNotifications:
    def __init__(self):
        self.sent: List[Dict[str, str]] = []

    def _dispatch(self, channel: str, message: str, target: str) -> Dict[str, str]:
        envelope = {"channel": channel, "message": message, "target": target}
        self.sent.append(envelope)
        return envelope

    def slack(self, message: str, channel: str) -> Dict[str, str]:
        return self._dispatch("slack", message, channel)

    def teams(self, message: str, channel: str) -> Dict[str, str]:
        return self._dispatch("teams", message, channel)

    def email(self, message: str, address: str) -> Dict[str, str]:
        return self._dispatch("email", message, address)

    def drift_alert(self, org: str, detail: str) -> Dict[str, str]:
        return self.slack(f"Model drift detected for {org}: {detail}", "#ai-ops")

    def security_anomaly(self, org: str, detail: str) -> Dict[str, str]:
        return self.email(f"Security anomaly for {org}: {detail}", "secops@example.com")

    def sla_warning(self, org: str, detail: str) -> Dict[str, str]:
        return self.teams(f"SLA warning for {org}: {detail}", "SLA-Team")
