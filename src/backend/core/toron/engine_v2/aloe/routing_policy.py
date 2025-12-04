"""
Routing Policy — selects models per tier
"""

class RoutingPolicy:
    def __init__(self, config):
        self.config = config

    def select_models(self, request):
        tier = request.get("tier", "free")

        if tier == "free":
            return ["claude-haiku", "gpt-4o-mini"]
        if tier == "student":
            return ["claude-haiku", "gpt-4o-mini"]
        if tier == "pro":
            return ["gpt-4o", "claude-sonnet"]
        return ["gpt-4o", "claude-sonnet", "gemini-pro"]
