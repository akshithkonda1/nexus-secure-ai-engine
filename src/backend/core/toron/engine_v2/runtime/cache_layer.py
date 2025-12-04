"""
Encrypted Redis Cache Layer — AES-GCM + Brotli.
"""

import brotli
import redis.asyncio as redis
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import base64
import json
import time


class CacheLayer:
    def __init__(self):
        self.redis = redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379/0")
        )
        self.key = base64.b64decode(
            os.getenv("CACHE_AES_KEY", base64.b64encode(os.urandom(32)))
        )

    def _encrypt(self, plaintext: bytes, aad: str):
        aes = AESGCM(self.key)
        nonce = os.urandom(12)
        ciphertext = aes.encrypt(nonce, plaintext, aad.encode())
        return base64.b64encode(nonce + ciphertext).decode()

    def _decrypt(self, ciphertext_b64: str, aad: str):
        raw = base64.b64decode(ciphertext_b64.encode())
        nonce = raw[:12]
        ciphertext = raw[12:]
        aes = AESGCM(self.key)
        return aes.decrypt(nonce, ciphertext, aad.encode())

    async def set(self, key: str, value: dict, aal: str, ttl=86400):
        raw = json.dumps(value).encode()
        compressed = brotli.compress(raw)
        encrypted = self._encrypt(compressed, aal)
        await self.redis.set(key, encrypted, ex=ttl)

    async def get(self, key: str, aal: str):
        encrypted = await self.redis.get(key)
        if not encrypted:
            return None
        decrypted = self._decrypt(encrypted.decode(), aal)
        decompressed = brotli.decompress(decrypted)
        return json.loads(decompressed.decode())
