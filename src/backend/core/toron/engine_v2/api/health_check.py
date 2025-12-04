"""
Health Check — readiness and liveness probes
"""

class HealthCheck:
    @staticmethod
    def status():
        return {
            "engine": "Toron v2.0",
            "status": "healthy",
            "version": "2.0",
        }


