"""
OIDC handler supporting discovery documents and token verification with HS256.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
from typing import Dict, Optional

from .idp_metadata_cache import IdPMetadataCache


class OIDCHandler:
    def __init__(self, client_secret: str, metadata_cache: Optional[IdPMetadataCache] = None):
        self.client_secret = client_secret.encode()
        self.metadata_cache = metadata_cache or IdPMetadataCache()

    def decode_jwt(self, token: str) -> Dict[str, str]:
        header_b64, payload_b64, signature_b64 = token.split(".")
        payload = json.loads(base64.urlsafe_b64decode(self._pad(payload_b64)))
        signature = base64.urlsafe_b64decode(self._pad(signature_b64))
        expected_sig = hmac.new(
            self.client_secret, msg=f"{header_b64}.{payload_b64}".encode(), digestmod=hashlib.sha256
        ).digest()
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("OIDC token signature invalid")
        return payload

    def validate(self, token: str, expected_audience: str, issuer: str) -> Dict[str, str]:
        payload = self.decode_jwt(token)
        if payload.get("aud") != expected_audience:
            raise ValueError("Audience mismatch")
        if payload.get("iss") != issuer:
            raise ValueError("Issuer mismatch")
        metadata = self.metadata_cache.get(issuer) or {}
        return {"claims": payload, "issuer_metadata": metadata}

    def cache_metadata(self, issuer: str, metadata: dict) -> None:
        self.metadata_cache.set(issuer, metadata)

    @staticmethod
    def _pad(segment: str) -> str:
        return segment + "=" * (-len(segment) % 4)
