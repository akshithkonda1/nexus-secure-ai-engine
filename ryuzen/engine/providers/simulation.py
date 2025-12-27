"""
Simulation provider for TORON v2.5h+

Provides deterministic mock responses for testing and development.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import time
from typing import Any, Dict

import numpy as np

from .base import BaseProvider, ProviderConfig, ProviderResponse

logger = logging.getLogger("ryuzen.providers.simulation")


class SimulationProvider(BaseProvider):
    """
    Simulation provider for testing without real API calls.

    Generates deterministic responses based on prompt hash.
    """

    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self._call_count = 0

    async def generate(self, prompt: str) -> ProviderResponse:
        """Generate simulated response."""
        self._call_count += 1
        start_time = time.time()

        # Create deterministic seed from prompt
        seed = int(
            hashlib.sha256(f"{prompt}:{self._call_count}".encode()).hexdigest()[:8], 16
        )
        seed = seed % (2**32)
        rng = np.random.RandomState(seed)

        # Simulate error rate
        if rng.random() < self.config.error_rate:
            self._record_error()
            raise RuntimeError(f"Simulated failure for {self.model_name}")

        # Simulate latency
        jitter = rng.randint(-50, 50)
        latency = max(100, self.config.base_latency_ms + jitter)
        await asyncio.sleep(latency / 1000.0)

        # Generate response content
        content = self._generate_content(prompt, rng)

        # Generate fingerprint
        fingerprint = hashlib.sha256(content.encode()).hexdigest()[:16]

        # Calculate tokens (approximation)
        tokens_used = max(50, len(prompt.split()) + rng.randint(10, 50))

        # Calculate confidence
        confidence = 0.75 + rng.random() * 0.2

        latency_ms = int((time.time() - start_time) * 1000)
        self._record_success(latency_ms)

        return ProviderResponse(
            model=self.model_name,
            content=content,
            confidence=confidence,
            latency_ms=latency_ms,
            tokens_used=tokens_used,
            fingerprint=fingerprint,
            metadata={
                "provider": "simulation",
                "model_id": self.model_id,
                "tier": self.config.tier,
            },
        )

    async def health_check(self) -> bool:
        """Simulation providers are always healthy."""
        return True

    def _generate_content(self, prompt: str, rng: np.random.RandomState) -> str:
        """Generate simulated response content."""
        # Create style-appropriate response
        style = self.config.style

        templates = {
            "balanced": "Based on careful analysis, {topic} involves several key considerations. The evidence suggests a nuanced perspective that balances multiple factors.",
            "creative": "Exploring {topic} opens up fascinating possibilities. Consider the innovative approaches that emerge when we think beyond conventional boundaries.",
            "analytical": "A systematic examination of {topic} reveals important patterns. The data indicates specific trends that warrant careful consideration.",
            "technical": "From a technical standpoint, {topic} requires understanding of core mechanisms. The implementation details are crucial for proper execution.",
            "precise": "Regarding {topic}, precision is essential. The specific parameters and requirements must be clearly defined and measured.",
            "multilingual": "Considering {topic} from multiple linguistic and cultural perspectives reveals interesting insights. Different frameworks offer unique contributions.",
            "harmonious": "Synthesizing perspectives on {topic} leads to a balanced understanding. The integration of diverse viewpoints creates a more complete picture.",
            "search": "Current information about {topic} indicates several relevant findings. Recent sources provide updated context for this query.",
            "real-time-reasoning": "Real-time analysis of {topic} shows dynamic factors at play. Current conditions and emerging trends inform this assessment.",
            "reasoning": "Through careful step-by-step reasoning about {topic}, we can derive logical conclusions. Each step builds upon established premises.",
            "chain-of-thought": "Let's think through {topic} systematically. First, we identify key elements. Then, we examine relationships. Finally, we synthesize conclusions.",
            "judicial": "Examining {topic} with judicial rigor requires weighing all evidence. The arbitrated conclusion balances competing considerations with epistemic care.",
        }

        template = templates.get(style, templates["balanced"])
        topic = prompt[:50] if len(prompt) > 50 else prompt

        base_response = template.format(topic=topic)

        # Add some variability
        additions = [
            " This assessment draws on multiple authoritative sources.",
            " Further investigation may reveal additional nuances.",
            " The confidence in this conclusion is relatively high.",
            " Related considerations include broader contextual factors.",
        ]

        selected_additions = rng.choice(additions, size=rng.randint(1, 3), replace=False)
        full_response = base_response + "".join(selected_additions)

        return f"[{self.model_name} | {style}] {full_response}"
