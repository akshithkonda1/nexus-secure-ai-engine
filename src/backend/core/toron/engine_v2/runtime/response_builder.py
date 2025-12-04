"""
ResponseBuilder — produces structured Toron responses.
"""

class ResponseBuilder:
    def build(self, result, context):
        return {
            "final_answer": result.get("final_answer"),
            "models_considered": context.get("selected_models"),
            "confidence": result.get("confidence"),
            "reasoning_trace": result,
        }
