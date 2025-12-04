"""
Execution Graph (DAG) for Toron Engine v2.0
"""

import asyncio

class ExecutionGraph:
    def __init__(self):
        self.nodes = {}
        self.dependencies = {}

    def add_node(self, node_id, executor, deps=None):
        self.nodes[node_id] = executor
        self.dependencies[node_id] = deps or []

    def build(self, request, context, routing):
        self.add_node("debate", context["debate_engine"].run, [])
        self.add_node("extract_facts", context["fact_extractor"].extract, ["debate"])

        if context["config"].enable_web_validation and request.get("allow_web"):
            self.add_node("web_search", context["web_search"].run, ["extract_facts"])

        self.add_node("validate", context["validator"].validate,
                      ["web_search"] if request.get("allow_web") else ["extract_facts"])

        self.add_node("consensus", context["consensus_engine"].integrate, ["validate"])

    async def execute(self, context):
        results = {}

        async def run_node(node):
            for dep in self.dependencies[node]:
                if dep not in results:
                    await run_node(dep)
            results[node] = await self.nodes[node](context)

        await run_node("consensus")
        return results["consensus"]
