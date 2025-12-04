"""
Consent Manager — Toron Engine v2.0
"""

class ConsentManager:
    REQUIRED = ["allow_web", "allow_memory", "allow_storage"]

    def allowed(self, request):
        return all(field in request for field in self.REQUIRED)
