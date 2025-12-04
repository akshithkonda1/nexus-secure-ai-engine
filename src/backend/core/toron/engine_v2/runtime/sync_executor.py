"""
Sync Executor — standard request execution path.
"""


class SyncExecutor:
    def __init__(self, lifecycle):
        self.lifecycle = lifecycle

    async def run(self, request, context):
        return await self.lifecycle.run(request, context)
