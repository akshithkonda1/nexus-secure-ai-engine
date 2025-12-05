"""
Lightweight Toron engine wiring for the Ryuzen backend.

This module keeps the runtime importable even when optional dependencies
(such as trust and compliance layers) are unavailable. It integrates the
existing Toron fusion pipeline, optional hallucination validation, and
response lineage tracking.
"""
from __future__ import annotations

import importlib
import logging
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

SRC_PATH = Path(__file__).resolve().parents[2] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.append(str(SRC_PATH))

_hallucination_guard_spec = importlib.util.find_spec("ryuzen.trust.hallucination_guard")
HallucinationGuard = None
if _hallucination_guard_spec:
    HallucinationGuard = importlib.import_module("ryuzen.trust.hallucination_guard").HallucinationGuard

_response_lineage_spec = importlib.util.find_spec("ryuzen.trust.response_lineage")
ResponseLineage = None
if _response_lineage_spec:
    ResponseLineage = importlib.import_module("ryuzen.trust.response_lineage").ResponseLineage

_ask_toron_path = SRC_PATH / "backend" / "toron" / "askToron.py"
ask_toron = None

logger = logging.getLogger(__name__)


@dataclass
class ToronRequest:
    message: str


class ToronEngine:
    """Adapter that wires Toron processing with optional trust signals."""

    def __init__(self, enable_trust: bool = True):
        self.guard = HallucinationGuard() if (enable_trust and HallucinationGuard) else None
        self.lineage = ResponseLineage() if ResponseLineage else None

    async def run(self, message: str, memory: Optional[Iterable[Any]] = None) -> Dict[str, Any]:
        global ask_toron

        if ask_toron is None and _ask_toron_path.exists() and os.getenv("RYUZEN_USE_TORON_PIPELINE"):
            spec = importlib.util.spec_from_file_location("ryuzen._ask_toron", _ask_toron_path)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                try:
                    spec.loader.exec_module(module)  # type: ignore[arg-type]
                    ask_toron = getattr(module, "ask_toron", None)
                except Exception:
                    logger.exception("Failed to load Toron pipeline; falling back to stub")

        if ask_toron is None:
            logger.warning("Toron pipeline unavailable; returning echo response")
            return {"response": message, "validation": None, "lineage": None}

        req = ToronRequest(message=message)
        reply = await ask_toron(req, memory or [])

        validation = None
        if self.guard:
            evaluate = getattr(self.guard, "evaluate", None)
            validate = getattr(self.guard, "validate", None)
            try:
                if callable(evaluate):
                    validation = evaluate([reply])
                elif callable(validate):
                    validation = validate([reply])
            except Exception:
                logger.exception("Hallucination guard evaluation failed")

        lineage_block = None
        if self.lineage:
            try:
                lineage_block = self.lineage.add_block(
                    prompt=message,
                    model_set=["toron-fusion"],
                    tfidf_metadata={"tokens": len(message)},
                    behavioral_signature="toron",
                    debate_rounds=1,
                )
            except Exception:
                logger.exception("Lineage tracking failed")

        return {"response": reply, "validation": validation, "lineage": lineage_block}


def run_sync(message: str, memory: Optional[Iterable[Any]] = None) -> Dict[str, Any]:
    """Synchronous helper for environments without an event loop."""
    import asyncio

    engine = ToronEngine()
    return asyncio.get_event_loop().run_until_complete(engine.run(message, memory))
