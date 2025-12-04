"""
Stream Executor — SSE / token-by-token streaming pipeline.
"""

class StreamExecutor:
    def __init__(self, adapter, lifecycle):
        self.adapter = adapter
        self.lifecycle = lifecycle

    async def run(self, request, context):
        # Not full SSE — starter version
        yield "BEGIN\n"

        result = await self.lifecycle.run(request, context)

        yield f"ANSWER: {result.get('final_answer', '')}\n"
        yield "END\n"
