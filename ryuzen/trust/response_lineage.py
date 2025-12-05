"""Response lineage wiring with optional cryptographic backing."""
from __future__ import annotations

import importlib
import logging
from typing import List, Optional

_lineage_spec = importlib.util.find_spec("enterprise.trust.response_lineage")
_ResponseLineage = None
LineageBlock = None  # type: ignore
if _lineage_spec:
    module = importlib.import_module("enterprise.trust.response_lineage")
    _ResponseLineage = getattr(module, "ResponseLineage", None)
    LineageBlock = getattr(module, "LineageBlock", None)

logger = logging.getLogger(__name__)


class ResponseLineage:
    def __init__(self):
        self._impl = _ResponseLineage() if _ResponseLineage else None
        self.blocks: List = []

    def add_block(
        self,
        prompt: str,
        model_set: List[str],
        tfidf_metadata: dict,
        behavioral_signature: str,
        debate_rounds: int,
    ) -> Optional[object]:
        if self._impl:
            return self._impl.add_block(prompt, model_set, tfidf_metadata, behavioral_signature, debate_rounds)

        block = {
            "prompt": prompt,
            "model_set": model_set,
            "tfidf_metadata": tfidf_metadata,
            "behavioral_signature": behavioral_signature,
            "debate_rounds": debate_rounds,
        }
        self.blocks.append(block)
        logger.debug("Lineage captured without cryptographic attestation: %s", block)
        return block

    def chain_valid(self) -> bool:
        if self._impl:
            return self._impl.chain_valid()
        return True

    def export_public_key(self) -> str | None:
        if self._impl:
            return self._impl.export_public_key()
        return None
