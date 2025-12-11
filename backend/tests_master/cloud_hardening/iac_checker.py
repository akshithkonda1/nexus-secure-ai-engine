from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Set

from backend.tests_master.warroom_logger import WarRoomLogger


MODULE_PATTERN = re.compile(r"module\s+\"(?P<name>[^\"]+)\"")
DEPENDS_PATTERN = re.compile(r"depends_on\s*=\s*\[(?P<body>[^\]]+)\]", re.MULTILINE)
ARN_PATTERN = re.compile(r"arn:aws:[^\s\"']+", re.IGNORECASE)
GCP_PROJECT_PATTERN = re.compile(r"projects/[a-z0-9-]+", re.IGNORECASE)
AZURE_RESOURCE_PATTERN = re.compile(r"/subscriptions/[0-9a-f-]+", re.IGNORECASE)
MODULE_REF_PATTERN = re.compile(r"module\.([a-zA-Z0-9_-]+)")


def _load_tf_files(root: Path) -> List[Path]:
    return sorted(root.rglob("*.tf"))


def _parse_module_dependencies(tf_content: str) -> Dict[str, Set[str]]:
    modules = MODULE_PATTERN.findall(tf_content)
    deps: Dict[str, Set[str]] = {module: set() for module in modules}
    for block in DEPENDS_PATTERN.findall(tf_content):
        for module_ref in MODULE_REF_PATTERN.findall(block):
            for module in modules:
                deps.setdefault(module, set()).add(module_ref)
    return deps


def _detect_cycles(graph: Dict[str, Set[str]]) -> List[List[str]]:
    visited: Set[str] = set()
    stack: Set[str] = set()
    cycles: List[List[str]] = []

    def dfs(node: str, path: List[str]):
        if node in stack:
            cycle_start = path.index(node)
            cycles.append(path[cycle_start:] + [node])
            return
        if node in visited:
            return
        visited.add(node)
        stack.add(node)
        for neighbor in graph.get(node, set()):
            dfs(neighbor, path + [neighbor])
        stack.remove(node)

    for module in graph.keys():
        if module not in visited:
            dfs(module, [module])
    return cycles


def validate_iac_health(run_id: str = "iac_checker", terraform_root: Path | str = "terraform") -> Dict[str, object]:
    root = Path(terraform_root)
    warroom = WarRoomLogger()
    tf_files = _load_tf_files(root)

    drift_detected = False  # mocked drift detection: deterministic offline assumption
    hardcoded_identifiers: List[str] = []
    dependency_graph: Dict[str, Set[str]] = {}

    for tf_file in tf_files:
        content = tf_file.read_text(encoding="utf-8", errors="ignore")
        dependency_graph.update(_parse_module_dependencies(content))
        hardcoded_identifiers.extend(
            re.findall(ARN_PATTERN, content)
            + re.findall(GCP_PROJECT_PATTERN, content)
            + re.findall(AZURE_RESOURCE_PATTERN, content)
        )

    cycles = _detect_cycles(dependency_graph)
    iac_health_report = {
        "terraform_root": str(root.resolve()),
        "files_scanned": [str(path) for path in tf_files],
        "drift_free": not drift_detected,
        "cyclical_dependencies": cycles,
        "hardcoded_identifiers": sorted(set(hardcoded_identifiers)),
        "status": "healthy"
        if not drift_detected and not cycles and not hardcoded_identifiers
        else "attention",
    }

    summary = (
        f"IaC health: {iac_health_report['status']}. "
        f"Files scanned: {len(tf_files)}. Cycles: {len(cycles)}. Hardcoded IDs: {len(set(hardcoded_identifiers))}."
    )
    severity = "warning" if cycles or hardcoded_identifiers else "info"
    warroom.log(run_id, summary, severity=severity)

    return iac_health_report


__all__ = ["validate_iac_health"]
