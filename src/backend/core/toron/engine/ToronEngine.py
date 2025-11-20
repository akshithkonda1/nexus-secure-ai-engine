from __future__ import annotations

import time
from typing import Any, Callable, Dict, Iterable, Optional

from nexus.plan_resolver import UserTierContext

from .ErrorShaper import ErrorShaper
from .ModelNormalizer import ModelNormalizer
from .ResponseBuilder import ResponseBuilder
from .ToronStreamExecutor import ToronStreamExecutor
from .ToronSyncExecutor import ToronSyncExecutor


class ToronEngine:
    """Toron Engine v1.6 — Core Layer orchestrator."""

    def __init__(
        self,
        *,
        crypter,
        access,
        sync_executor: ToronSyncExecutor,
        stream_executor: ToronStreamExecutor,
        normalizer: ModelNormalizer,
        response_builder: ResponseBuilder,
        error_shaper: ErrorShaper,
    ) -> None:
        self.crypter = crypter
        self.access = access
        self.sync_executor = sync_executor
        self.stream_executor = stream_executor
        self.normalizer = normalizer
        self.response_builder = response_builder
        self.error_shaper = error_shaper

    def _aad(self, session_id: str) -> bytes:
        return f"{self.access.tenant_id}|{self.access.instance_id}|{self.access.user_id}|{session_id}".encode(
            "utf-8"
        )

    def decrypt(self, payload: str, *, session_id: str) -> str:
        try:
            return self.crypter.decrypt(payload, aad=self._aad(session_id))
        except Exception:
            return payload

    def encrypt(self, payload: str, *, session_id: str) -> str:
        try:
            return self.crypter.encrypt(payload, aad=self._aad(session_id))
        except Exception:
            return payload

    async def handle(
        self,
        session_id: str,
        query: str,
        *,
        streaming: bool = False,
        policy_name: Optional[str] = None,
        want_photos: bool = False,
        requested_models: Optional[Iterable[str]] = None,
        user: Optional[UserTierContext] = None,
        telemetry_opt_in: bool = False,
        stream_callback: Optional[Callable[[str, Dict[str, Any]], Any]] = None,
    ) -> Dict[str, Any]:
        decrypted_query = self.decrypt(query, session_id=session_id)
        start = time.time()
        if streaming:
            result = await self.stream_executor.execute(
                session_id=session_id,
                query=decrypted_query,
                policy_name=policy_name,
                want_photos=want_photos,
                requested_models=requested_models,
                user=user,
                telemetry_opt_in=telemetry_opt_in,
                stream_callback=stream_callback,
            )
        else:
            result = await self.sync_executor.execute(
                session_id=session_id,
                query=decrypted_query,
                policy_name=policy_name,
                want_photos=want_photos,
                requested_models=requested_models,
                user=user,
                telemetry_opt_in=telemetry_opt_in,
            )
        shaped = self.error_shaper.shape(result)
        if shaped is result:
            shaped = self.response_builder.build(result)
        shaped["latency_ms"] = shaped.get("latency_ms", 0.0) or ((time.time() - start) * 1000.0)
        shaped["response"] = self.encrypt(str(shaped.get("response", "")), session_id=session_id)
        shaped.setdefault("models_considered", result.get("models_considered") or result.get("models_used") or [])
        shaped.setdefault("meta", result if isinstance(result, dict) else {})
        return shaped


__all__ = ["ToronEngine"]
