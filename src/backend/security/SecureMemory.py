"""Ephemeral memory primitives to avoid residual plaintext."""
from __future__ import annotations

import contextlib
from typing import Any, Dict, Generator


def secure_buffer(size: int) -> bytearray:
    return bytearray(size)


def wipe_buffer(buffer: bytearray) -> None:
    for i in range(len(buffer)):
        buffer[i] = 0


def scrub_dict(obj: Dict[str, Any]) -> None:
    for key in list(obj.keys()):
        value = obj[key]
        if isinstance(value, (bytearray, bytes)):
            mutable = bytearray(value)
            wipe_buffer(mutable)
        obj[key] = None
    obj.clear()


def scrub_text(text: str) -> str:
    # Strings are immutable; return blanked value for caller to drop references
    return "" if text else text


@contextlib.contextmanager
def secure_memory(size: int = 4096) -> Generator[bytearray, None, None]:
    buf = secure_buffer(size)
    try:
        yield buf
    finally:
        wipe_buffer(buf)


__all__ = ["secure_buffer", "wipe_buffer", "scrub_dict", "scrub_text", "secure_memory"]
