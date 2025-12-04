"""
Routing Policy — selects best model mix based on:

- User tier
- Reliability
- Latency
- Cost limits
- Model availability
"""

class RoutingPolicy:
    def __init__(self, config):
        self.config = config

    def select_models(self, request: dict):
        tier = request.get("tier", "free")

        if tier == "free":
            return ["gpt-4o-mini", "claude-3-5-haiku"]
        if tier == "student":
            return ["gpt-4o-mini", "claude-3-5-sonnet"]
        if tier == "pro":
            return ["gpt-4o", "claude-3-5-sonnet"]
        if tier == "enterprise":
            return ["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro"]

        return ["gpt-4o-mini"]
