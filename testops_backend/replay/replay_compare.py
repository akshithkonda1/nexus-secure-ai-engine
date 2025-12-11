import json
from typing import Dict, Tuple


def compare_snapshots(left: Dict, right: Dict) -> Tuple[bool, float]:
    """Return byte-for-byte equality and a determinism score."""

    left_bytes = json.dumps(left, sort_keys=True).encode()
    right_bytes = json.dumps(right, sort_keys=True).encode()
    matches = left_bytes == right_bytes
    # determinism score is 100 when identical, otherwise scaled by byte match ratio
    min_len = max(len(left_bytes), len(right_bytes)) or 1
    common = sum(1 for a, b in zip(left_bytes, right_bytes) if a == b)
    determinism_score = 100.0 * (common / min_len)
    return matches, determinism_score
