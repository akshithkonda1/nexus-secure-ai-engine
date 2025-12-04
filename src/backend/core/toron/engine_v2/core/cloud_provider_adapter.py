"""
CloudProviderAdapter — unified multi-cloud orchestrator.
Handles:
- provider failover
- model registry
- cost optimization
- diversity routing
"""

class CloudProviderAdapter:

    def __init__(self, connectors, config):
        self.connectors = connectors
        self.config = config

    async def dispatch(self, messages, model):
        """
        Primary call handler with failover.
        """
        for provider in self.config.provider_priority:
            if provider in self.connectors:
                try:
                    return await self.connectors[provider].infer(messages, model)
                except Exception:
                    continue
        return {"error": "All providers failed."}, {}

    async def list_all_models(self):
        all_models = []
        for c in self.connectors.values():
            try:
                models = await c.list_models()
                if models:
                    all_models.extend(models)
            except Exception:
                pass
        return all_models
