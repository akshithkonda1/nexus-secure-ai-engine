from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Set

from backend.tests_master.warroom_logger import WarRoomLogger


PUBLIC_CIDR = "0.0.0.0/0"
ALLOWED_PUBLIC_MARKERS = {"allow-public", "public-ok", "toron-public-ok"}
TORON_KEYWORDS = {"toron", "ryuzen", "engine"}


def _collect_policy_files(root: Path) -> List[Path]:
    return [
        path
        for path in root.rglob("*")
        if path.is_file() and path.suffix in {".yaml", ".yml", ".json", ".tf"}
    ]


def _line_contains_marker(line: str) -> bool:
    lowered = line.lower()
    return any(marker in lowered for marker in ALLOWED_PUBLIC_MARKERS)


def _detect_toron_public_exposure(content: str) -> bool:
    lowered = content.lower()
    return any(keyword in lowered for keyword in TORON_KEYWORDS) and (
        "loadbalancer" in lowered or "public" in lowered or PUBLIC_CIDR in lowered
    )


def analyze_network_policies(
    run_id: str = "network_policy_checker", repo_root: Path | str = "."
) -> Dict[str, object]:
    root = Path(repo_root)
    warroom = WarRoomLogger()

    unrestricted_entries: List[str] = []
    toron_public_endpoints: Set[str] = set()

    for file_path in _collect_policy_files(root):
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        lines = content.splitlines()
        for idx, line in enumerate(lines, start=1):
            if PUBLIC_CIDR in line and not _line_contains_marker(line):
                unrestricted_entries.append(f"{file_path}:{idx}")
        if _detect_toron_public_exposure(content):
            toron_public_endpoints.add(str(file_path))

    findings = {
        "scan_root": str(root.resolve()),
        "unrestricted_rules": sorted(unrestricted_entries),
        "toron_public_endpoints": sorted(toron_public_endpoints),
        "all_private_by_default": not unrestricted_entries and not toron_public_endpoints,
    }

    summary = (
        f"Network policy audit complete. Unrestricted rules: {len(unrestricted_entries)}, "
        f"Toron exposures: {len(toron_public_endpoints)}."
    )
    severity = "warning" if unrestricted_entries or toron_public_endpoints else "info"
    warroom.log(run_id, summary, severity=severity)
    return findings


__all__ = ["analyze_network_policies"]
