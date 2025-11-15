"""Basic Locust load test for the Nexus /debate endpoint."""

from __future__ import annotations

import os
from typing import Any

from locust import HttpUser, between, task


def _default_payload() -> dict[str, Any]:
    return {
        "prompt": os.getenv("LOCUST_PROMPT", "Summarize the value of secure AI orchestration."),
        "models": [m for m in os.getenv("LOCUST_MODELS", "model-a").split(",") if m],
        "deadline_ms": int(os.getenv("LOCUST_DEADLINE_MS", "120000")),
    }


class DebateUser(HttpUser):
    wait_time = between(float(os.getenv("LOCUST_WAIT_MIN", "1")), float(os.getenv("LOCUST_WAIT_MAX", "3")))

    def on_start(self) -> None:
        self.api_key = os.getenv("LOCUST_API_KEY", "")
        self.payload = _default_payload()

    @task
    def invoke_debate(self) -> None:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        self.client.post("/debate", json=self.payload, headers=headers, name="/debate")
