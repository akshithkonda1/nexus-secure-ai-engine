"""
Error Shaper — user-friendly error transformations.
"""


class ErrorShaper:
    def shape(self, error_dict):
        return {
            "status": "error",
            "error_message": error_dict.get("error_message", "Unknown engine error."),
            "confidence": 0.0,
            "details": error_dict
        }
