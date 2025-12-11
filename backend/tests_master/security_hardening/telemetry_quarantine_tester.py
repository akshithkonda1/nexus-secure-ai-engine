from __future__ import annotations

import hashlib
import random
import string
from dataclasses import dataclass
from typing import Dict, Iterable, List

from .pii_scrubber_tester import PII_PATTERNS, _engine_scrubber


@dataclass
class TelemetryEntry:
    entry_id: str
    payload: str
    checksum: str
    quarantined: bool
    bucket: str
    deletion_permitted: bool


def _random_string(length: int = 8) -> str:
    return "".join(random.choice(string.ascii_letters + string.digits) for _ in range(length))


def _generate_entries(count: int = 5000) -> Iterable[str]:
    templates = [
        "User Dana logged in from 172.16.0.5 with email dana@test.com",
        "Payment attempt by Bob with card 4111-1111-1111-1111 at 10.1.1.7",
        "API call from 192.168.56.1 using token abc123 for Alice",
        "Support ticket by Charlie phone 202-555-7890; IP 8.8.8.8",
    ]
    for i in range(count):
        yield f"{templates[i % len(templates)]} trace={_random_string()}"


def _checksum(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def _bucket_for(entry: str) -> str:
    digest = hashlib.md5(entry.encode()).hexdigest()
    return f"bucket-{int(digest, 16) % 10}"


def run_telemetry_quarantine_suite() -> Dict[str, object]:
    quarantined: List[TelemetryEntry] = []
    for raw_entry in _generate_entries():
        scrubbed, _ = _engine_scrubber(raw_entry)
        checksum = _checksum(scrubbed)
        bucket = _bucket_for(scrubbed)
        entry = TelemetryEntry(
            entry_id=_random_string(12),
            payload=scrubbed,
            checksum=checksum,
            quarantined=True,
            bucket=bucket,
            deletion_permitted=True,
        )
        quarantined.append(entry)

    anonymized = all(not pattern.search(item.payload) for item in quarantined for pattern in PII_PATTERNS.values())
    checksums_valid = all(item.checksum == _checksum(item.payload) for item in quarantined)
    bucket_distribution = {entry.bucket for entry in quarantined}
    deletable = all(entry.deletion_permitted for entry in quarantined)

    telemetry_integrity_report = {
        "total_entries": len(quarantined),
        "anonymization_passed": anonymized,
        "checksum_valid": checksums_valid,
        "bucket_count": len(bucket_distribution),
        "deletion_permitted": deletable,
        "sample": quarantined[:3],
    }

    return telemetry_integrity_report


__all__ = ["run_telemetry_quarantine_suite", "TelemetryEntry"]
