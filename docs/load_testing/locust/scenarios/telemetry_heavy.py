from locust import TaskSet, task


class TelemetryHeavy(TaskSet):
    @task(2)
    def telemetry_summary(self):
        with self.client.get(
            "/api/v1/telemetry/summary",
            headers={"X-Ryuzen-Key": "dev-key"},
            name="telemetry-summary",
        ) as resp:
            resp.raise_for_status()

    @task(1)
    def websocket_upgrade(self):
        # Locust HTTPUser cannot open WebSocket; simulate upgrade request to validate routing
        self.client.get(
            "/ws/stream",
            headers={"X-Ryuzen-Key": "dev-key"},
            name="ws-upgrade",
            allow_redirects=False,
        )
