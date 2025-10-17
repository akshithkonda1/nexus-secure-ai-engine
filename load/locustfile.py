import os
import random
import time
from locust import HttpUser, task, between, events

BASE_PATH = os.getenv("BASE_URL", "http://localhost:8080")
API_KEY = os.getenv("API_KEY", "test-key-123")
DEADLINE_MS = int(os.getenv("DEADLINE_MS", "6000"))
WANT_PHOTOS = os.getenv("WANT_PHOTOS", "false").lower() == "true"
PROMPTS_FILE = os.getenv("PROMPTS_FILE", "load/prompts.txt")

try:
    with open(PROMPTS_FILE, "r", encoding="utf-8") as f:
        PROMPTS = [line.strip() for line in f if line.strip()]
except Exception:
    PROMPTS = ["What is Nexus?"]


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    import requests

    url = f"{BASE_PATH}/readyz"
    for _ in range(60):
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError("Service never became ready")


class NexusUser(HttpUser):
    wait_time = between(0.05, 0.3)

    @task
    def debate(self):
        prompt = random.choice(PROMPTS)
        payload = {
            "prompt": prompt,
            "deadline_ms": DEADLINE_MS,
            "want_photos": WANT_PHOTOS,
        }
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
        }
        with self.client.post(
            "/debate",
            json=payload,
            headers=headers,
            name="/debate",
            timeout=60,
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 429 and response.headers.get("Retry-After"):
                response.success()
            else:
                response.failure(f"bad status {response.status_code}")
