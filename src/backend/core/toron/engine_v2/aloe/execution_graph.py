"""
Execution Graph (DAG) for Toron Engine v2.0
"""

import asyncio

class ExecutionGraph:
    def __init__(self):
        self.nodes = {}
        self.dependencies = {}
        self.context_keys = {}

    def add_node(self, node_id, executor, deps=None, context_key=None):
        self.nodes[node_id] = executor
        self.dependencies[node_id] = deps or []
        if context_key:
            self.context_keys[node_id] = context_key

    def build(self, request, context, routing):
        self.add_node("debate", context["debate_engine"].run, [], context_key="debate_result")
        self.add_node("extract_facts", context["fact_extractor"].extract, ["debate"], context_key="facts")

        if context["config"].enable_web_validation and request.get("allow_web"):
            self.add_node("web_search", context["web_search"].run, ["extract_facts"], context_key="web_results")

        self.add_node(
            "validate",
            context["validator"].validate,
            ["web_search"] if request.get("allow_web") else ["extract_facts"],
            context_key="validation",
        )

        self.add_node("consensus", context["consensus_engine"].integrate, ["validate"], context_key="consensus")

    async def execute(self, context):
        results = {}

        async def run_node(node):
            for dep in self.dependencies[node]:
                if dep not in results:
                    await run_node(dep)
            results[node] = await self.nodes[node](context)
            if node in self.context_keys:
                context[self.context_keys[node]] = results[node]

        await run_node("consensus")
        return results["consensus"]
