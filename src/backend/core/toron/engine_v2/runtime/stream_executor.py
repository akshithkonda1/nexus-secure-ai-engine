"""
StreamExecutor — placeholder for SSE/WS streaming.
"""

class StreamExecutor:
    async def stream(self, provider_adapter, messages, model):
        async for token in provider_adapter.stream(messages, model):
            yield token
