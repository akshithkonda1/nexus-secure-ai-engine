"""
Execution Graph — DAG orchestrator for Toron Engine v2.0
Responsible for:

- Debate
- Fact Extraction
- Web Search
- Validation
- Consensus

All chained in dynamic dependency graph (QGC optimized).
"""

import asyncio
from typing import Dict, Callable, List, Any


class ExecutionGraph:
    def __init__(self):
        self.nodes = {}
        self.deps = {}

    def add_node(self, node_id: str, executor: Callable, depends: List[str] = None):
        self.nodes[node_id] = executor
        self.deps[node_id] = depends or []

    def build(self, request: dict, context: dict, routing):
        """
        Construct DAG dynamically based on request properties.
        """

        # Debate always required
        self.add_node("debate", context["debate_engine"].run)

        # Fact extraction
        self.add_node("extract_facts", context["fact_extractor"].extract, ["debate"])

        # Web search only with consent
        if request.get("allow_web", False):
            self.add_node("web_search", context["web_search"].run, ["extract_facts"])
            validation_deps = ["extract_facts", "web_search"]
        else:
            validation_deps = ["extract_facts"]

        # Validation
        self.add_node("validate", context["validator"].validate, validation_deps)

        # Consensus
        self.add_node("consensus", context["consensus_engine"].integrate, ["validate"])

    async def execute(self, context: dict) -> dict:
        """
        Execute DAG in correct dependency order.
        """

        results = {}

        async def run(node_id):
            for d in self.deps[node_id]:
                if d not in results:
                    await run(d)
            results[node_id] = await self.nodes[node_id](context)

        # Always end with consensus
        await run("consensus")
        return results["consensus"]
