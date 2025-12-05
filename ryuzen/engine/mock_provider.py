import random
from typing import Dict, Any


class MockProvider:
    def __init__(self, model_name, style, signature, latency_ms=300, jitter_ms=50, error_rate=0.02):
        self.model_name = model_name
        self.style = style
        self.signature = signature
        self.latency_ms = latency_ms
        self.jitter_ms = jitter_ms
        self.error_rate = error_rate

    async def generate(self, prompt: str) -> Dict[str, Any]:
        if random.random() < self.error_rate:
            return {"model": self.model_name, "error": "simulated_failure"}

        prefix = {
            "harmonious": "In essence, ",
            "balanced": "Simply put, ",
            "search": "Factually, ",
            "creative": "Imagine this: ",
            "precise": "Technically, ",
            "reasoning": "Step-by-step: ",
            "technical": "Formally, ",
        }.get(self.style, "")

        output = f"{prefix}{prompt}"

        return {
            "model": self.model_name,
            "behavior": self.signature,
            "output": output,
            "confidence": round(random.uniform(0.75, 0.95), 2),
        }
