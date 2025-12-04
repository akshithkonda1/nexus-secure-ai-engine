"""
ExecutionGraph — Directed Acyclic Graph execution engine.
"""

import asyncio


class ExecutionGraph:
    def __init__(self):
        self.nodes = {}
        self.edges = {}

    def add_node(self, node_id, executor, deps=None):
        self.nodes[node_id] = executor
        self.edges[node_id] = deps or []

    def build(self, request, context, routing):
        """
        Builds a static graph for now:
            INPUT → DEBATE → FACTS → WEB SEARCH → VALIDATE → CONSENSUS
        """

        self.add_node("debate", context["debate_engine"].run)
        self.add_node("facts", context["fact_extractor"].extract, ["debate"])
        self.add_node("web_search", context["web_search"].run, ["facts"])
        self.add_node("validation", context["validator"].validate, ["web_search"])
        self.add_node("consensus", context["consensus_engine"].integrate, ["validation"])

    async def execute(self, context):
        results = {}

        async def run_node(node):
            deps = self.edges.get(node, [])
            dep_results = {d: results[d] for d in deps}

            result = await self.nodes[node](context)
            results[node] = result
            context[node] = result
            return result

        # Execute nodes in dependency order
        for node in ["debate", "facts", "web_search", "validation", "consensus"]:
            await run_node(node)

        return results["consensus"]
