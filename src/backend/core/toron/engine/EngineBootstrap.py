from __future__ import annotations

import logging
from typing import Optional

from nexus.ai.bootstrap import BootstrapError, _build_resolver, make_connectors
from nexus.ai.nexus_engine import (
    AccessContext,
    Crypter,
    Engine,
    EngineConfig,
    build_connectors_cloud_first,
    build_web_retriever_from_env,
)
from nexus.ai.nexus_flask_app import CORE_CONFIG, _build_access_context, build_memory

from .CloudProviderAdapter import CloudProviderAdapter
from .ExecutionPolicy import ExecutionPolicy
from .ModelNormalizer import ModelNormalizer
from .ModelRouter import ModelRouter
from .ResponseBuilder import ResponseBuilder
from .ToronEngine import ToronEngine
from .ToronStreamExecutor import ToronStreamExecutor
from .ToronSyncExecutor import ToronSyncExecutor
from .ErrorShaper import ErrorShaper

log = logging.getLogger(__name__)


def _resolve_secrets():
    secret_resolver = getattr(CORE_CONFIG, "secret_resolver", None)
    if not secret_resolver:
        try:
            secret_resolver = CORE_CONFIG._resolver  # type: ignore[attr-defined]
        except AttributeError:
            secret_resolver = None
    if not secret_resolver:
        secret_resolver = _build_resolver(CORE_CONFIG)
    return secret_resolver


def _build_crypter(resolver) -> Crypter:
    if not resolver:
        raise BootstrapError("Secret resolver unavailable; encryption is mandatory")
    return Crypter.from_resolver(resolver)


def _build_connectors(resolver) -> CloudProviderAdapter:
    try:
        connectors = build_connectors_cloud_first(resolver=resolver)
    except Exception as exc:
        log.warning("cloud_first_connectors_unavailable", extra={"error": str(exc)})
        connectors = make_connectors(CORE_CONFIG)
    return CloudProviderAdapter(connectors)


def _build_web_layer(resolver):
    web_retriever = build_web_retriever_from_env(resolver=resolver)
    return web_retriever


def get_engine(config: Optional[EngineConfig] = None) -> ToronEngine:
    engine_config = config or EngineConfig(max_context_messages=CORE_CONFIG.max_context_messages)
    resolver = _resolve_secrets()
    memory = build_memory(CORE_CONFIG)
    access_context: AccessContext = _build_access_context()
    crypter = _build_crypter(resolver)
    adapter = _build_connectors(resolver)
    web_retriever = _build_web_layer(resolver)
    base_engine = Engine(
        connectors=adapter.connectors,
        memory=memory,
        web=web_retriever,
        access=access_context,
        crypter=crypter,
        config=engine_config,
    )
    policy = ExecutionPolicy(engine_config)
    router = ModelRouter(adapter)
    normalizer = ModelNormalizer()
    response_builder = ResponseBuilder()
    error_shaper = ErrorShaper()
    sync_exec = ToronSyncExecutor(base_engine, adapter, policy, router, normalizer, response_builder, error_shaper)
    stream_exec = ToronStreamExecutor(base_engine, adapter, policy, router, normalizer, response_builder, error_shaper)
    return ToronEngine(
        crypter=crypter,
        access=access_context,
        sync_executor=sync_exec,
        stream_executor=stream_exec,
        normalizer=normalizer,
        response_builder=response_builder,
        error_shaper=error_shaper,
    )


__all__ = ["get_engine"]
