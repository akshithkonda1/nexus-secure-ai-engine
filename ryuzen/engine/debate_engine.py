"""Wrapper around the Toron debate engine with safe fallbacks."""
from __future__ import annotations

import importlib
import logging
import sys
from pathlib import Path
from typing import Any, Dict

SRC_PATH = Path(__file__).resolve().parents[2] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.append(str(SRC_PATH))

_debate_engine_spec = importlib.util.find_spec("backend.core.toron.engine_v2.core.debate_engine")
CoreDebateEngine = None
if _debate_engine_spec:
    CoreDebateEngine = importlib.import_module("backend.core.toron.engine_v2.core.debate_engine").DebateEngine

logger = logging.getLogger(__name__)


class DebateEngine:
    def __init__(self, adapter: Any | None = None):
        self.adapter = adapter
        self._impl = CoreDebateEngine(adapter) if CoreDebateEngine else None

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        if self._impl is None:
            logger.warning("Core debate engine unavailable; returning passthrough context")
            prompt = context.get("prompt") if isinstance(context, dict) else None
            return {"summary": prompt or "", "model_outputs": {}}

        return await self._impl.run(context)
