"""Encrypted Redis cache with compression and integrity checks."""
from __future__ import annotations

import asyncio
import hashlib
import os
from typing import Optional

import brotli
import redis.asyncio as redis
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from pydantic import BaseModel, field_validator

from src.backend.core.toron.engine.consensus_integrator import ToronConsensus


class CacheConfig(BaseModel):
    """Configuration for cache layer."""

    redis_url: str = "redis://localhost:6379/0"
    ttl_seconds: int = 60 * 60 * 24
    secret_key: str = "toron-default-key"

    @field_validator("ttl_seconds")
    @classmethod
    def validate_ttl(cls, value: int) -> int:
        return max(60, value)


class CacheLayer:
    """Async Redis cache wrapper with encryption and integrity checks."""

    def __init__(self, config: CacheConfig | None = None) -> None:
        self.config = config or CacheConfig()
        self._redis = redis.from_url(self.config.redis_url, encoding="utf-8", decode_responses=False)
        self._key = hashlib.sha256(self.config.secret_key.encode()).digest()

    @staticmethod
    def build_key(prompt: str, context_hash: str | None = None) -> str:
        context_part = context_hash or "default"
        digest = hashlib.sha256(f"{prompt}:{context_part}".encode()).hexdigest()
        return f"toron:consensus:{digest}"

    def _encrypt(self, plaintext: bytes) -> bytes:
        aesgcm = AESGCM(self._key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext, None)
        digest = hashlib.sha256(ciphertext).digest()
        return nonce + ciphertext + digest

    def _decrypt(self, payload: bytes) -> Optional[bytes]:
        try:
            nonce, body = payload[:12], payload[12:-32]
            checksum = payload[-32:]
            if hashlib.sha256(body).digest() != checksum:
                return None
            aesgcm = AESGCM(self._key)
            return aesgcm.decrypt(nonce, body, None)
        except Exception:
            return None

    async def get_cached_result(self, key: str) -> Optional[ToronConsensus]:
        try:
            data = await asyncio.wait_for(self._redis.get(key), timeout=0.1)
        except Exception:
            return None
        if not data:
            return None

        decrypted = self._decrypt(data)
        if not decrypted:
            return None

        try:
            decompressed = brotli.decompress(decrypted)
            return ToronConsensus.model_validate_json(decompressed.decode("utf-8"))
        except Exception:
            return None

    async def set_cached_result(self, key: str, value: ToronConsensus) -> None:
        try:
            serialized = value.model_dump_json().encode("utf-8")
            compressed = brotli.compress(serialized)
            encrypted = self._encrypt(compressed)
            await asyncio.wait_for(
                self._redis.setex(key, self.config.ttl_seconds, encrypted), timeout=0.2
            )
        except Exception:
            return None

    @classmethod
    def from_environment(cls) -> "CacheLayer":
        redis_url = os.getenv("TORON_REDIS_URL", "redis://localhost:6379/0")
        secret_key = os.getenv("TORON_CACHE_SECRET", "toron-default-key")
        ttl = int(os.getenv("TORON_CACHE_TTL", "86400"))
        return cls(CacheConfig(redis_url=redis_url, secret_key=secret_key, ttl_seconds=ttl))
