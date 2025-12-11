"""Warroom logging utilities."""
from __future__ import annotations

from pathlib import Path
from typing import Iterable

BACKEND_ROOT = Path(__file__).resolve().parents[1]
WARROOM_DIR = BACKEND_ROOT / "warroom" / "master"
WARROOM_DIR.mkdir(parents=True, exist_ok=True)


def log_error(run_id: str, messages: Iterable[str]) -> Path:
    """Persist errors to the warroom ledger for the given run."""

    WARROOM_DIR.mkdir(parents=True, exist_ok=True)
    log_path = WARROOM_DIR / f"{run_id}.log"
    with log_path.open("a", encoding="utf-8") as handle:
        for line in messages:
            handle.write(f"{line}\n")
    return log_path


__all__ = ["log_error", "WARROOM_DIR"]
