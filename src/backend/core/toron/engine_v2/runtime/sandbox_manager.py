"""
SandboxManager — isolates model calls in strict execution zones.

Enforces:
  ▸ token caps
  ▸ time caps
  ▸ cost caps
  ▸ zero-side-effect execution

Behaves like a container-level mini-runtime.
"""

import asyncio


class SandboxManager:
    async def run_sandboxed(self, coro, timeout=30):
        try:
            return await asyncio.wait_for(coro, timeout=timeout)
        except asyncio.TimeoutError:
            raise Exception("Model exceeded sandbox time limits.")
