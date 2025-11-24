"""Multi-cloud router with safety-aware failover for Toron."""
from __future__ import annotations

from dataclasses import dataclass, field
from time import monotonic
from typing import Dict, List, Optional, Sequence

from src.backend.utils.Logging import SafeLogger


@dataclass
class ProviderStatus:
    name: str
    endpoint: str
    last_latency_ms: float = 0.0
    failure_count: int = 0
    refusal_rate: float = 0.0
    available: bool = True
    annotations: Dict[str, str] = field(default_factory=dict)


@dataclass
class RouteDecision:
    provider: str
    strategy: str
    failover_chain: List[str]
    safe_mode: bool


class MultiCloudFailoverRouter:
    """Routes traffic between cloud backends with safety-aware failover."""

    def __init__(self, latency_threshold_ms: float = 1800.0) -> None:
        self.latency_threshold_ms = latency_threshold_ms
        self.logger = SafeLogger("ryuzen-router")
        self._providers: Dict[str, ProviderStatus] = {}
        self._default_chain = [
            ("aws-bedrock", "https://bedrock.aws"),
            ("openai", "https://api.openai.com"),
            ("google-vertex", "https://vertex.googleapis.com"),
            ("anthropic", "https://api.anthropic.com"),
            ("local", "http://localhost:11434"),
        ]
        for name, endpoint in self._default_chain:
            self.register_provider(name, endpoint)

    def register_provider(self, name: str, endpoint: str) -> None:
        self._providers[name] = ProviderStatus(name=name, endpoint=endpoint)

    def record_latency(self, provider: str, latency_ms: float) -> None:
        if provider in self._providers:
            self._providers[provider].last_latency_ms = latency_ms

    def record_failure(self, provider: str) -> None:
        if provider in self._providers:
            self._providers[provider].failure_count += 1

    def record_refusal(self, provider: str) -> None:
        if provider in self._providers:
            status = self._providers[provider]
            status.refusal_rate = min(1.0, status.refusal_rate + 0.1)

    def route(
        self,
        preferred: Optional[Sequence[str]],
        risk_score: float,
        drift_score: float,
        tenant_allow_list: Optional[Sequence[str]] = None,
        safety_violation: bool = False,
    ) -> RouteDecision:
        """Route to a provider, falling back when risk or latency is high."""

        allow_list = list(tenant_allow_list) if tenant_allow_list else [p[0] for p in self._default_chain]
        chain = [p for p in (preferred or allow_list) if p in allow_list]
        if not chain:
            chain = allow_list

        failover_chain: List[str] = []
        chosen_provider: Optional[str] = None
        safe_mode = safety_violation or risk_score > 0.6 or drift_score > 0.45

        for provider in chain:
            status = self._providers.get(provider)
            if not status or not status.available:
                failover_chain.append(provider)
                continue
            if status.last_latency_ms and status.last_latency_ms > self.latency_threshold_ms:
                failover_chain.append(provider)
                continue
            if status.failure_count >= 3 or status.refusal_rate > 0.4:
                failover_chain.append(provider)
                continue
            if safe_mode and provider == "local":
                failover_chain.append(provider)
                continue
            chosen_provider = provider
            break

        if chosen_provider is None:
            failover_chain.extend(chain)
            self.logger.error(
                "route-decision-failed",
                chain=chain,
                risk=risk_score,
                drift=drift_score,
                safe_mode=safe_mode,
            )
            raise RuntimeError("No available providers for failover chain")

        self.logger.info(
            "route-decision",
            provider=chosen_provider,
            chain=failover_chain,
            risk=risk_score,
            drift=drift_score,
            safe_mode=safe_mode,
        )
        return RouteDecision(provider=chosen_provider, strategy="failover", failover_chain=failover_chain, safe_mode=safe_mode)

    def availability_snapshot(self) -> Dict[str, Dict[str, float]]:
        """Return provider availability for telemetry overlays."""

        snapshot: Dict[str, Dict[str, float]] = {}
        for name, status in self._providers.items():
            snapshot[name] = {
                "latency_ms": status.last_latency_ms,
                "failures": status.failure_count,
                "refusal_rate": status.refusal_rate,
                "available": status.available,
            }
        return snapshot

    def heartbeat(self) -> None:
        """Mark all providers as responsive in the absence of errors."""

        now = monotonic()
        if int(now) % 50 == 0:
            for status in self._providers.values():
                status.available = True


__all__ = ["MultiCloudFailoverRouter", "ProviderStatus", "RouteDecision"]
