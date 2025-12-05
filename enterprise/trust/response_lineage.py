"""
Response lineage tracking with cryptographic attestation.
"""
from __future__ import annotations

import json
import time
from dataclasses import dataclass, asdict
from hashlib import blake2b
from typing import List

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization


@dataclass
class LineageBlock:
    prompt_hash: str
    model_set: List[str]
    tfidf_metadata: dict
    behavioral_signature: str
    debate_rounds: int
    prev_hash: str
    signature: str
    created_at: float

    def to_json(self) -> str:
        return json.dumps(asdict(self))


class ResponseLineage:
    def __init__(self):
        self.blocks: List[LineageBlock] = []
        self.signing_key = Ed25519PrivateKey.generate()

    def _hash_block(self, payload: dict) -> str:
        h = blake2b(digest_size=32)
        h.update(json.dumps(payload, sort_keys=True).encode())
        return h.hexdigest()

    def _sign(self, payload: bytes) -> str:
        return self.signing_key.sign(payload).hex()

    def add_block(self, prompt: str, model_set: List[str], tfidf_metadata: dict, behavioral_signature: str, debate_rounds: int) -> LineageBlock:
        prev_hash = self.blocks[-1].signature if self.blocks else "genesis"
        payload = {
            "prompt_hash": self._hash_block({"prompt": prompt}),
            "model_set": model_set,
            "tfidf_metadata": tfidf_metadata,
            "behavioral_signature": behavioral_signature,
            "debate_rounds": debate_rounds,
            "prev_hash": prev_hash,
            "created_at": time.time(),
        }
        signature = self._sign(json.dumps(payload, sort_keys=True).encode())
        block = LineageBlock(**payload, signature=signature)
        self.blocks.append(block)
        return block

    def chain_valid(self) -> bool:
        for idx, block in enumerate(self.blocks):
            expected_prev = "genesis" if idx == 0 else self.blocks[idx - 1].signature
            if block.prev_hash != expected_prev:
                return False
            payload = {
                "prompt_hash": block.prompt_hash,
                "model_set": block.model_set,
                "tfidf_metadata": block.tfidf_metadata,
                "behavioral_signature": block.behavioral_signature,
                "debate_rounds": block.debate_rounds,
                "prev_hash": block.prev_hash,
                "created_at": block.created_at,
            }
            try:
                self.signing_key.public_key().verify(bytes.fromhex(block.signature), json.dumps(payload, sort_keys=True).encode())
            except Exception:
                return False
        return True

    def export_public_key(self) -> str:
        return (
            self.signing_key.public_key()
            .public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo)
            .decode()
        )
