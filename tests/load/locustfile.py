from locust import HttpUser, task, between
import json
import base64
import time


class RyuzenUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def ask_toron(self):
        payload = {
            "prompt": "benchmark test: what is the meaning of life?",
            "stream": False
        }

        encoded = base64.b64encode(json.dumps(payload).encode()).decode()

        self.client.post(
            "/api/v1/ask",
            json={"data": encoded}
        )

    @task
    def health(self):
        self.client.get("/api/v1/health")

    @task
    def telemetry(self):
        self.client.get("/api/v1/telemetry/summary")
