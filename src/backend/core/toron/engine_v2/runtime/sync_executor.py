"""
SyncExecutor — orchestrates non-streaming model calls.
"""

class SyncExecutor:
    async def execute(self, provider_adapter, messages, model):
        return await provider_adapter.dispatch(messages, model)
