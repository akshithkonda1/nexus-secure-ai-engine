"""In-memory helpers for sensitive data."""
from __future__ import annotations

import contextlib
import secrets
from typing import Iterator


@contextlib.contextmanager
def secure_buffer(data: bytes) -> Iterator[bytearray]:
    buf = bytearray(data)
    try:
        yield buf
    finally:
        for idx in range(len(buf)):
            buf[idx] = 0


def generate_nonce(size: int = 12) -> bytes:
    return secrets.token_bytes(size)
