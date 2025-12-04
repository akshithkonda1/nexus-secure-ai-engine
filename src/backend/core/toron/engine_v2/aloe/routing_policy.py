"""
Routing Policy — intelligent model selection.

Selects models based on:
- user tier
- budget constraints
- diversity between clouds
- reliability scores
"""

import random


class RoutingPolicy:
    def __init__(self, config):
        self.config = config

    def select_models(self, request):
        tier = request.get("tier", "free")

        # Basic starter model sets by tier
        if tier == "free":
            # Cheapest / smallest models
            return ["gpt-4o-mini", "claude-3-5-haiku-20241022"]

        if tier == "student":
            return ["gpt-4o-mini", "claude-3-5-haiku-20241022", "gemini-1.5-flash"]

        if tier == "pro":
            return [
                "gpt-4o",
                "claude-3-5-sonnet-20241022",
                "gemini-1.5-pro",
            ]

        if tier == "ultra":
            return [
                "gpt-4o",
                "claude-3-5-sonnet-20241022",
                "gemini-1.5-pro",
                "llama3-70b-8192",
            ]

        # Enterprise tier uses all available connectors
        return self.config.enterprise_model_list
