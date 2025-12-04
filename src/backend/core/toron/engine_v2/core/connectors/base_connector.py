"""
Base Connector — required interface for all model providers.
"""

class BaseConnector:
    async def infer(self, messages, model, **kwargs):
        raise NotImplementedError

    async def stream(self, messages, model, **kwargs):
        raise NotImplementedError

    async def list_models(self):
        raise NotImplementedError

    async def health_check(self):
        return True
