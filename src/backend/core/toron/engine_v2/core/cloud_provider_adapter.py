"""
Cloud Provider Adapter — Multi-cloud Failover
Handles:
  • Async connector calls
  • Per-provider priority
  • Timeout
  • Graceful fallback
"""

import asyncio


class CloudProviderAdapter:
    def __init__(self, connectors, config):
        self.connectors = connectors
        self.config = config

    async def dispatch(self, messages, model):
        errors = []

        for provider in self.config.provider_priority:
            if provider not in self.connectors:
                continue

            try:
                response, meta = await asyncio.wait_for(
                    self.connectors[provider].infer(messages, model),
                    timeout=self.config.model_timeout_seconds
                )
                return response, meta

            except asyncio.TimeoutError:
                errors.append(f"{provider} timeout")
            except Exception as e:
                errors.append(f"{provider} {str(e)}")

        raise Exception("All providers failed: " + "; ".join(errors))

    async def list_all_models(self):
        out = []
        tasks = [
            c.list_models()
            for c in self.connectors.values()
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for r in results:
            if not isinstance(r, Exception):
                out.extend(r)

        return out

    async def health_check_all(self):
        statuses = {}
        tasks = [
            c.health_check() for c in self.connectors.values()
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for (name, _), res in zip(self.connectors.items(), results):
            statuses[name] = bool(res) and not isinstance(res, Exception)

        return statuses
