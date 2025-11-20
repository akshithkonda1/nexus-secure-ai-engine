from __future__ import annotations

import asyncio
from typing import Any, Dict, Iterable, Optional

from nexus.plan_resolver import UserTierContext

from .CloudProviderAdapter import CloudProviderAdapter
from .ErrorShaper import ErrorShaper
from .ExecutionPolicy import ExecutionPolicy
from .ModelNormalizer import ModelNormalizer
from .ModelRouter import ModelRouter
from .ResponseBuilder import ResponseBuilder


class ToronSyncExecutor:
    """Non-streaming execution path leveraging the existing Nexus Engine."""

    def __init__(
        self,
        engine,
        adapter: CloudProviderAdapter,
        policy: ExecutionPolicy,
        router: ModelRouter,
        normalizer: ModelNormalizer,
        builder: ResponseBuilder,
        error_shaper: ErrorShaper,
    ) -> None:
        self.engine = engine
        self.adapter = adapter
        self.policy = policy
        self.router = router
        self.normalizer = normalizer
        self.builder = builder
        self.error_shaper = error_shaper

    async def execute(
        self,
        session_id: str,
        query: str,
        *,
        policy_name: Optional[str] = None,
        want_photos: bool = False,
        requested_models: Optional[Iterable[str]] = None,
        user: Optional[UserTierContext] = None,
        telemetry_opt_in: bool = False,
    ) -> Dict[str, Any]:
        chosen_models, _, suggestion = self.router.route(requested_models, user)
        result = await self.engine.run_async(
            session_id=session_id,
            query=query,
            policy_name=policy_name,
            want_photos=want_photos,
            requested_models=chosen_models,
            user=user,
            telemetry_opt_in=telemetry_opt_in,
        )
        if suggestion:
            result.setdefault("meta", {})["suggested"] = suggestion
        shaped = self.error_shaper.shape(result)
        if shaped is result:
            shaped = self.builder.build(result)
        return shaped

    def execute_blocking(self, *args, **kwargs) -> Dict[str, Any]:
        return asyncio.run(self.execute(*args, **kwargs))


__all__ = ["ToronSyncExecutor"]
