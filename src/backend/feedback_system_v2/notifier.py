"""High priority feedback notifier."""
from __future__ import annotations

import json
import os
import smtplib
from email.message import EmailMessage
from typing import Any, Dict

import requests


class FeedbackNotifier:
    def __init__(self) -> None:
        self.slack_webhook = os.environ.get("FEEDBACK_SLACK_WEBHOOK")
        self.teams_webhook = os.environ.get("FEEDBACK_TEAMS_WEBHOOK")
        self.smtp_host = os.environ.get("FEEDBACK_SMTP_HOST")
        self.smtp_from = os.environ.get("FEEDBACK_SMTP_FROM", "noreply@example.com")
        self.smtp_to = os.environ.get("FEEDBACK_SMTP_TO")

    def notify_slack(self, message: str) -> bool:
        if not self.slack_webhook:
            return False
        try:
            response = requests.post(self.slack_webhook, json={"text": message}, timeout=5)
            return response.status_code < 300
        except Exception:
            return False

    def notify_teams(self, message: str) -> bool:
        if not self.teams_webhook:
            return False
        try:
            response = requests.post(self.teams_webhook, json={"text": message}, timeout=5)
            return response.status_code < 300
        except Exception:
            return False

    def notify_email(self, subject: str, body: str) -> bool:
        if not self.smtp_host or not self.smtp_to:
            return False
        msg = EmailMessage()
        msg["From"] = self.smtp_from
        msg["To"] = self.smtp_to
        msg["Subject"] = subject
        msg.set_content(body)
        try:
            with smtplib.SMTP(self.smtp_host) as client:
                client.send_message(msg)
            return True
        except Exception:
            return False

    def alert(self, record: Dict[str, Any]) -> None:
        priority = record.get("analysis", {}).get("priority", 1)
        if priority < 4:
            return
        message = f"High priority feedback (score {priority}): {record.get('analysis', {}).get('summary')}"
        self.notify_slack(message)
        self.notify_teams(message)
        self.notify_email("High priority feedback", json.dumps(record, indent=2))


def get_notifier() -> FeedbackNotifier:
    return FeedbackNotifier()
