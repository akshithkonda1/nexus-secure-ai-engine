from locust import TaskSet, task


class ConnectorsHeavy(TaskSet):
    @task(3)
    def list_connectors(self):
        with self.client.get("/api/v1/connectors", headers={"X-Ryuzen-Key": "dev-key"}, name="connectors") as resp:
            resp.raise_for_status()

    @task(1)
    def model_catalog(self):
        with self.client.get("/api/v1/models", headers={"X-Ryuzen-Key": "dev-key"}, name="models") as resp:
            resp.raise_for_status()

    @task(1)
    def health_probe(self):
        with self.client.get("/api/v1/health", name="health") as resp:
            resp.raise_for_status()
