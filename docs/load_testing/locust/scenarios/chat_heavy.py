from locust import TaskSet, task


class ChatHeavy(TaskSet):
    @task(5)
    def ask_chat(self):
        payload = {
            "prompt": "Provide a structured summary of the latest security bulletin",
            "model": "gpt-4o",
            "stream": False,
        }
        with self.client.post("/api/v1/ask", json=payload, headers={"X-Ryuzen-Key": "dev-key"}, name="ask") as resp:
            resp.raise_for_status()

    @task(1)
    def stream_chat(self):
        params = {"prompt": "Send SSE tokens", "model": "gpt-4o"}
        with self.client.get("/api/v1/stream", params=params, headers={"X-Ryuzen-Key": "dev-key"}, name="sse", stream=True) as resp:
            resp.raise_for_status()
            # consume limited bytes to simulate client
            _ = resp.content[:512]
