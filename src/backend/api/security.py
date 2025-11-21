from __future__ import annotations

import base64
import os
import re
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAX_TOKEN_LENGTH = 10_000
MAX_CONTENT_LENGTH = 40_000

EMAIL_PATTERN = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.IGNORECASE)
PHONE_PATTERN = re.compile(r"\+?\d[\d\s().-]{8,}\d")
SSN_PATTERN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
CREDIT_PATTERN = re.compile(r"\b(?:\d[ -]*?){13,16}\b")
ADDRESS_PATTERN = re.compile(
    r"\b\d{1,5}\s+\w+(?:\s+\w+){1,3}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b",
    re.IGNORECASE,
)


def _get_encryption_key() -> bytes:
    raw = os.environ.get("PROJECT_ENCRYPTION_KEY")
    if raw:
        try:
            decoded = base64.urlsafe_b64decode(raw)
            if len(decoded) == 32:
                return decoded
        except Exception:
            pass
        if len(raw) >= 32:
            return raw.encode()[:32]
    fallback = os.environ.get("PROJECT_ENCRYPTION_PASSPHRASE", "nexus-projects-default")
    return fallback.encode().ljust(32, b"0")[:32]


@dataclass
class AESCipher:
    key: bytes

    def encrypt(self, plaintext: str) -> str:
        aesgcm = AESGCM(self.key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
        return base64.b64encode(nonce + ciphertext).decode("utf-8")

    def decrypt(self, token: str) -> str:
        aesgcm = AESGCM(self.key)
        raw = base64.b64decode(token)
        nonce, ct = raw[:12], raw[12:]
        plaintext = aesgcm.decrypt(nonce, ct, None)
        return plaintext.decode("utf-8")


def get_cipher() -> AESCipher:
    return AESCipher(_get_encryption_key())


def normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def sanitize_text(value: str) -> str:
    cleaned = normalize_whitespace(value or "")
    cleaned = EMAIL_PATTERN.sub("[redacted]", cleaned)
    cleaned = PHONE_PATTERN.sub("[redacted]", cleaned)
    cleaned = SSN_PATTERN.sub("[redacted]", cleaned)
    cleaned = CREDIT_PATTERN.sub("[redacted]", cleaned)
    cleaned = ADDRESS_PATTERN.sub("[redacted]", cleaned)
    cleaned = cleaned[:MAX_CONTENT_LENGTH]
    tokens = cleaned.split()
    if len(tokens) > MAX_TOKEN_LENGTH:
        cleaned = " ".join(tokens[:MAX_TOKEN_LENGTH])
    return cleaned


def sanitize_messages(messages: Iterable[dict]) -> list[dict]:
    sanitized = []
    for message in messages:
        if not isinstance(message, dict):
            continue
        role = "assistant" if message.get("role") == "assistant" else "user"
        content = sanitize_text(message.get("content", ""))
        ts_raw = message.get("timestamp")
        try:
            if isinstance(ts_raw, str):
                ts = datetime.fromisoformat(ts_raw)
            elif isinstance(ts_raw, datetime):
                ts = ts_raw
            else:
                ts = datetime.utcnow()
        except Exception:
            ts = datetime.utcnow()
        sanitized.append(
            {
                "role": role,
                "content": content,
                "timestamp": ts,
            }
        )
    return sanitized
