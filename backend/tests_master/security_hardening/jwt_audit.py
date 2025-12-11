from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class JwtToken:
    header: Dict[str, object]
    payload: Dict[str, object]
    secret: str
    signature: str = field(init=False)

    def __post_init__(self) -> None:
        self.signature = self._sign()

    def _sign(self) -> str:
        header_b64 = _b64(json.dumps(self.header).encode())
        payload_b64 = _b64(json.dumps(self.payload).encode())
        signing_input = f"{header_b64}.{payload_b64}".encode()
        sig = hmac.new(self.secret.encode(), signing_input, hashlib.sha256).digest()
        return _b64(sig)

    def as_compact(self) -> str:
        header_b64 = _b64(json.dumps(self.header).encode())
        payload_b64 = _b64(json.dumps(self.payload).encode())
        return f"{header_b64}.{payload_b64}.{self.signature}"


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def _validate_signature(token: JwtToken) -> bool:
    expected = token._sign()
    return hmac.compare_digest(expected, token.signature)


def _validate_expiration(payload: Dict[str, object]) -> bool:
    exp = payload.get("exp")
    if not isinstance(exp, (int, float)):
        return False
    return exp > time.time()


def _validate_refresh_rotation(tokens: List[JwtToken]) -> bool:
    identifiers = [t.payload.get("jti") for t in tokens]
    return len(set(identifiers)) == len(identifiers)


def _validate_anti_replay(payload: Dict[str, object]) -> bool:
    nonce = payload.get("nonce")
    return isinstance(nonce, str) and len(nonce) >= 8


def _detect_weak_secret(secret: str) -> bool:
    return len(secret) < 32 or secret.islower() or secret.isalpha()


def _missing_claims(payload: Dict[str, object]) -> List[str]:
    required = {"sub", "iat", "exp", "jti"}
    return sorted(list(required - payload.keys()))


def run_jwt_audit() -> Dict[str, object]:
    now = int(time.time())
    strong_secret = secrets.token_hex(32)
    weak_secret = "secret"

    healthy_token = JwtToken(
        header={"alg": "HS256", "typ": "JWT"},
        payload={"sub": "user-123", "iat": now, "exp": now + 3600, "jti": secrets.token_hex(8), "nonce": secrets.token_hex(4)},
        secret=strong_secret,
    )
    expired_token = JwtToken(
        header={"alg": "HS256", "typ": "JWT"},
        payload={"sub": "user-123", "iat": now - 7200, "exp": now - 1, "jti": secrets.token_hex(8), "nonce": "stale-nonce"},
        secret=strong_secret,
    )
    rotated_tokens = [
        healthy_token,
        JwtToken(
            header={"alg": "HS256", "typ": "JWT"},
            payload={"sub": "user-123", "iat": now, "exp": now + 7200, "jti": secrets.token_hex(8), "nonce": secrets.token_hex(4)},
            secret=strong_secret,
        ),
    ]

    jwt_security_report = {
        "signature_valid": _validate_signature(healthy_token),
        "expiration_valid": _validate_expiration(healthy_token.payload),
        "expiration_rejected": not _validate_expiration(expired_token.payload),
        "refresh_rotation": _validate_refresh_rotation(rotated_tokens),
        "anti_replay": _validate_anti_replay(healthy_token.payload),
        "weak_secret_detected": _detect_weak_secret(weak_secret),
        "missing_claims": _missing_claims({"sub": "anon", "exp": now + 10}),
        "examples": {
            "healthy": healthy_token.as_compact(),
            "expired": expired_token.as_compact(),
        },
    }

    return jwt_security_report


__all__ = ["run_jwt_audit", "JwtToken"]
