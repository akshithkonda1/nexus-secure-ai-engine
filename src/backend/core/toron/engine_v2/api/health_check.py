"""
Toron Health Check — ensures adapters + connectors are alive.
"""

class HealthCheck:
    def __init__(self, adapter):
        self.adapter = adapter

    async def status(self):
        return {
            "status": "ok",
            "providers": await self.adapter.health_check_all()
        }
