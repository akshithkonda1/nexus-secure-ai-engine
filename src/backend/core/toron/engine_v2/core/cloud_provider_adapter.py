"""
Cloud Provider Adapter — Multi-cloud Failover with CloudWatch telemetry.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, Dict, Iterable

from .health_monitor import HealthMonitor
from ..runtime.cloudwatch_telemetry import CloudWatchTelemetry
from .message_normalizer import MessageNormalizer


class CloudProviderAdapter:
    def __init__(self, connectors: Dict[str, Any], config, health_monitor: HealthMonitor | None = None):
        self.connectors = connectors
        self.config = config
        self.health_monitor = health_monitor or HealthMonitor(
            list(connectors.keys()), failure_threshold=3, cooldown_seconds=60
        )
        self.telemetry = CloudWatchTelemetry()

    async def dispatch(self, messages: Iterable[dict], model: str):
        errors = []

        for provider in self.config.provider_priority:
            if provider not in self.connectors:
                continue

            if not self.health_monitor.can_use(provider):
                self.telemetry.log(
                    "ProviderSkippedUnhealthy",
                    {"provider": provider},
                )
                continue

            connector = self.connectors[provider]
            start = time.time()

            try:
                normalized = MessageNormalizer.normalize_for_provider(messages, provider)
                response, metadata = await asyncio.wait_for(
                    connector.infer(normalized, model),
                    timeout=self.config.model_timeout_seconds,
                )

                latency = (time.time() - start) * 1000
                self.health_monitor.mark_success(provider)

                self.telemetry.metric(
                    "ProviderSuccess",
                    1,
                    unit="Count",
                    dims=[{"Name": "Provider", "Value": provider}],
                )
                self.telemetry.metric(
                    "ProviderLatency",
                    latency,
                    dims=[{"Name": "Provider", "Value": provider}],
                )
                self.telemetry.log(
                    "ProviderSuccessEvent",
                    {
                        "provider": provider,
                        "model": model,
                        "latency_ms": latency,
                        "metadata": metadata,
                    },
                )

                return response, metadata

            except asyncio.TimeoutError:
                latency = (time.time() - start) * 1000
                self.health_monitor.mark_failure(provider, "timeout")

                self._record_failure(provider, latency, "timeout")
                errors.append(f"{provider}: timeout")
                continue

            except Exception as e:
                latency = (time.time() - start) * 1000
                self.health_monitor.mark_failure(provider, str(e))

                self._record_failure(provider, latency, str(e))

                snapshot = self.health_monitor.snapshot().get(provider, {})
                if snapshot and not snapshot.get("healthy", True):
                    self.telemetry.log(
                        "CircuitBreakerTriggered",
                        {"provider": provider, "error": snapshot.get("last_error")},
                    )

                errors.append(f"{provider}: {str(e)}")
                continue

        raise Exception(f"All providers failed. Errors: {'; '.join(errors)}")

    async def list_all_models(self):
        out = []
        tasks = [c.list_models() for c in self.connectors.values()]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if not isinstance(result, Exception) and result:
                out.extend(result)

        return out

    async def health_check_all(self):
        statuses = {}
        tasks = {name: c.health_check() for name, c in self.connectors.items()}
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)

        for (name, _), result in zip(tasks.items(), results):
            if isinstance(result, Exception):
                self.health_monitor.mark_failure(name, reason="health_check_failed")
                statuses[name] = False
            else:
                if result:
                    self.health_monitor.mark_success(name)
                else:
                    self.health_monitor.mark_failure(name, reason="reported_unhealthy")
                statuses[name] = bool(result)

        self.telemetry.log("HealthCheck", statuses)
        return statuses

    # ---------------------------
    # Internal helpers
    # ---------------------------
    def _record_failure(self, provider: str, latency: float, error: str) -> None:
        self.telemetry.metric(
            "ProviderFailure",
            1,
            unit="Count",
            dims=[{"Name": "Provider", "Value": provider}],
        )
        self.telemetry.metric(
            "ProviderLatency",
            latency,
            dims=[{"Name": "Provider", "Value": provider}],
        )
        self.telemetry.log(
            "ProviderError",
            {
                "provider": provider,
                "error": error,
                "latency_ms": latency,
            },
        )
