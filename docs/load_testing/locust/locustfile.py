from locust import HttpUser, between
from scenarios.chat_heavy import ChatHeavy
from scenarios.connectors_heavy import ConnectorsHeavy
from scenarios.telemetry_heavy import TelemetryHeavy


class ToronUser(HttpUser):
    wait_time = between(1, 3)
    tasks = {ChatHeavy: 3, ConnectorsHeavy: 1, TelemetryHeavy: 1}
    host = "https://api.ryuzen.example.com"
