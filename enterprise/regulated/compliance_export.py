from __future__ import annotations

import csv
import io
import json
import logging
import os
import zipfile
from dataclasses import dataclass
from typing import Dict, Iterable, List

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

logger = logging.getLogger(__name__)


@dataclass
class ComplianceArtifact:
    name: str
    content: Dict[str, object]


class ComplianceExporter:
    def __init__(self, artifacts: Iterable[ComplianceArtifact]) -> None:
        self.artifacts = list(artifacts)

    def to_json(self) -> str:
        payload = {artifact.name: artifact.content for artifact in self.artifacts}
        return json.dumps(payload, indent=2)

    def to_csv(self) -> str:
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        for artifact in self.artifacts:
            writer.writerow([artifact.name, json.dumps(artifact.content, sort_keys=True)])
        return buffer.getvalue()

    def to_encrypted_zip(self, key: bytes | None = None) -> bytes:
        key = key or AESGCM.generate_key(bit_length=256)
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)

        with io.BytesIO() as memory_file:
            with zipfile.ZipFile(memory_file, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
                for artifact in self.artifacts:
                    zf.writestr(f"{artifact.name}.json", json.dumps(artifact.content, indent=2))
            plaintext = memory_file.getvalue()
        ciphertext = aesgcm.encrypt(nonce, plaintext, b"compliance")
        logger.info("Compliance artifacts sealed into encrypted ZIP (AES-256-GCM)")
        return nonce + ciphertext
