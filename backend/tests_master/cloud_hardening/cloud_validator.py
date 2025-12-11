from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Set

from backend.tests_master.warroom_logger import WarRoomLogger


VENDOR_IMPORT_MAP: Dict[str, List[str]] = {
    "aws": [r"\bboto3\b", r"\bbotocore\b", r"aws[-_.]sdk", r"from\s+aws\b", r"import\s+aws"],
    "gcp": [r"google\.cloud", r"googleapiclient", r"from\s+google\b", r"import\s+google\b"],
    "azure": [r"\bazure\b", r"from\s+azure\b", r"import\s+azure"],
}

CRITICAL_DOMAINS = ("mal", "storage", "snapshot", "telemetry")


def _iter_repo_files(root: Path) -> List[Path]:
    return [
        path
        for path in root.rglob("*.py")
        if ".venv" not in path.parts and "__pycache__" not in path.parts
    ]


def _find_vendor_imports(path: Path) -> Dict[str, bool]:
    content = path.read_text(encoding="utf-8", errors="ignore")
    matches: Dict[str, bool] = {}
    for vendor, patterns in VENDOR_IMPORT_MAP.items():
        matches[vendor] = any(re.search(pattern, content) for pattern in patterns)
    return matches


def _check_critical_dependencies(path: Path, vendor_matches: Dict[str, bool]) -> List[str]:
    lower_path = "/".join(path.parts).lower()
    if any(domain in lower_path for domain in CRITICAL_DOMAINS):
        return [vendor for vendor, matched in vendor_matches.items() if matched]
    return []


def validate_cloud_neutrality(run_id: str = "cloud_validator", repo_root: Path | str = ".") -> Dict[str, object]:
    root = Path(repo_root)
    warroom = WarRoomLogger()

    vendor_hits: Dict[str, Set[str]] = {"aws": set(), "gcp": set(), "azure": set()}
    critical_violations: List[str] = []

    for file_path in _iter_repo_files(root):
        vendor_matches = _find_vendor_imports(file_path)
        for vendor, matched in vendor_matches.items():
            if matched:
                vendor_hits[vendor].add(str(file_path))
        critical_vendor_refs = _check_critical_dependencies(file_path, vendor_matches)
        if critical_vendor_refs:
            critical_violations.append(
                f"{file_path}: vendor dependencies in critical domain ({', '.join(critical_vendor_refs)})"
            )

    total_vendor_refs = sum(len(paths) for paths in vendor_hits.values())
    penalty = min(70, total_vendor_refs * 5 + len(critical_violations) * 10)
    cloud_portability_score = max(0, 100 - penalty)

    report = {
        "cloud_portability_score": cloud_portability_score,
        "vendor_imports": {vendor: sorted(paths) for vendor, paths in vendor_hits.items()},
        "critical_section_violations": sorted(critical_violations),
        "scan_root": str(root.resolve()),
        "cloud_neutral": cloud_portability_score >= 90 and not critical_violations,
    }

    summary = (
        f"Cloud portability score: {cloud_portability_score}. "
        f"AWS={len(vendor_hits['aws'])}, GCP={len(vendor_hits['gcp'])}, Azure={len(vendor_hits['azure'])}."
    )
    if critical_violations:
        summary += f" Critical: {len(critical_violations)} findings."

    warroom.log(run_id, summary, severity="warning" if critical_violations else "info")
    return report


__all__ = ["validate_cloud_neutrality"]
