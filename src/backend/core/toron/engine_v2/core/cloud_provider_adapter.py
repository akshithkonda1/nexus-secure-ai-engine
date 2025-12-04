"""
CloudProviderAdapter — unified multi-cloud orchestrator with self-healing.

Responsibilities:

* Route requests across providers in priority order
* Respect provider health (via HealthMonitor)
* Apply timeouts and collect error traces
  """

from __future__ import annotations

import asyncio
from typing import Any, Dict, Optional

from .health_monitor import HealthMonitor


class CloudProviderAdapter:
    def __init__(
        self,
        connectors: Dict[str, Any],
        config: Any,
        health_monitor: Optional[HealthMonitor] = None,
    ) -> None:
        """
        :param connectors: mapping provider_name -> connector instance
        :param config: EngineConfig instance
        :param health_monitor: optional shared HealthMonitor
        """
        self.connectors = connectors
        self.config = config
        self.health_monitor = health_monitor or HealthMonitor(
            list(connectors.keys()),
            failure_threshold=3,
            cooldown_seconds=60,
        )

    async def dispatch(self, messages, model: str):
        """
        Dispatch a single inference request across providers.

        Behavior:
        - Follows config.provider_priority
        - Skips providers marked unhealthy by HealthMonitor
        - On failure/timeout: marks provider as failed and tries next
        - On success: marks provider as healthy and returns immediately
        """
        errors = []

        for provider in self.config.provider_priority:
            if provider not in self.connectors:
                continue

            if not self.health_monitor.can_use(provider):
                errors.append(f"{provider}: skipped (marked unhealthy)")
                continue

            connector = self.connectors[provider]

            try:
                response, metadata = await asyncio.wait_for(
                    connector.infer(messages, model),
                    timeout=self.config.model_timeout_seconds,
                )
                # mark success + return
                self.health_monitor.mark_success(provider)
                return response, metadata

            except asyncio.TimeoutError:
                self.health_monitor.mark_failure(provider, reason="timeout")
                errors.append(
                    f"{provider}: timeout after {self.config.model_timeout_seconds}s"
                )
                continue

            except Exception as e:  # noqa: BLE001
                self.health_monitor.mark_failure(provider, reason=str(e))
                errors.append(f"{provider}: {str(e)}")
                continue

        # If we got here, everything failed or was unhealthy
        raise Exception(f"All providers failed. Errors: {'; '.join(errors)}")

    async def list_all_models(self):
        """List models from all available providers."""
        all_models = []

        tasks = [connector.list_models() for connector in self.connectors.values()]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if not isinstance(result, Exception) and result:
                all_models.extend(result)

        return all_models

    async def health_check_all(self):
        """
        Check health of all providers and sync into HealthMonitor.
        """
        health_status = {}

        tasks = {name: conn.health_check() for name, conn in self.connectors.items()}
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)

        for (name, _), result in zip(tasks.items(), results):
            if isinstance(result, Exception):
                self.health_monitor.mark_failure(name, reason="health_check_failed")
                health_status[name] = False
            else:
                if result:
                    self.health_monitor.mark_success(name)
                else:
                    self.health_monitor.mark_failure(name, reason="reported_unhealthy")
                health_status[name] = bool(result)

        return {
            "providers": health_status,
            "monitor_state": self.health_monitor.snapshot(),
        }
