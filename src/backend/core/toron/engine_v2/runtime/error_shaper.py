"""
ErrorShaper — user-friendly error formatting.
"""

class ErrorShaper:
    def shape(self, error):
        return {
            "status": "error",
            "message": str(error),
            "confidence": 0.0
        }
