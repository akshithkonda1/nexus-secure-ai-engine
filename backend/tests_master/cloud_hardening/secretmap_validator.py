from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Set

from backend.tests_master.warroom_logger import WarRoomLogger


ENV_PATTERN = re.compile(r"os\.environ\.get\(['\"](?P<name>[A-Z0-9_]+)['\"]\)|os\.getenv\(['\"](?P<name2>[A-Z0-9_]+)['\"]\)")
SECRET_ASSIGNMENT_PATTERN = re.compile(
    r"(?P<key>[A-Za-z0-9_]*(?:SECRET|TOKEN|PASSWORD|API_KEY|APIKEY))\s*[:=]\s*[\"']?(?P<value>[^\s\"']+)",
    re.IGNORECASE,
)
CLOUD_SECRET_PATTERN = re.compile(r"\b(AWS|GCP|AZURE)_([A-Z0-9_]+)\b")


def _iter_candidate_files(root: Path) -> List[Path]:
    return [
        path
        for path in root.rglob("*")
        if path.is_file()
        and path.suffix in {".py", ".yaml", ".yml", ".json", ".env", ".ini", ".cfg"}
        and ".venv" not in path.parts
    ]


def _collect_env_references(content: str) -> Set[str]:
    envs = set(match.group("name") or match.group("name2") for match in ENV_PATTERN.finditer(content))
    envs.update({m.group(1) for m in re.finditer(r"\$\{([A-Z0-9_]+)\}", content)})
    return {env for env in envs if env}


def _find_hardcoded_secrets(content: str) -> List[str]:
    findings: List[str] = []
    for match in SECRET_ASSIGNMENT_PATTERN.finditer(content):
        value = match.group("value")
        if not re.search(r"\$\{[A-Z0-9_]+\}|<.+?>|REDACTED|CHANGEME", value, re.IGNORECASE):
            findings.append(f"{match.group('key')}={value}")
    return findings


def _assess_cloud_consistency(env_vars: Set[str]) -> Dict[str, List[str]]:
    mapping: Dict[str, Set[str]] = {}
    for match in (CLOUD_SECRET_PATTERN.match(var) for var in env_vars):
        if match:
            cloud, name = match.group(1), match.group(2)
            mapping.setdefault(name, set()).add(cloud)
    inconsistent = {name: sorted(clouds) for name, clouds in mapping.items() if len(clouds) != 3}
    return inconsistent


def validate_secret_maps(run_id: str = "secretmap_validator", repo_root: Path | str = ".") -> Dict[str, object]:
    root = Path(repo_root)
    warroom = WarRoomLogger()

    env_refs: Set[str] = set()
    hardcoded_tokens: List[str] = []

    for file_path in _iter_candidate_files(root):
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        env_refs.update(_collect_env_references(content))
        hardcoded_tokens.extend(_find_hardcoded_secrets(content))

    inconsistent_mappings = _assess_cloud_consistency(env_refs)

    secretmap_compliance_report = {
        "scan_root": str(root.resolve()),
        "env_backed_secrets": sorted(env_refs),
        "hardcoded_tokens": sorted(set(hardcoded_tokens)),
        "inconsistent_cloud_mappings": inconsistent_mappings,
        "compliant": not hardcoded_tokens and not inconsistent_mappings,
    }

    summary = (
        f"Secret map compliance: {'ok' if secretmap_compliance_report['compliant'] else 'issues found'}. "
        f"Env refs: {len(env_refs)}, hardcoded: {len(set(hardcoded_tokens))}, "
        f"inconsistent mappings: {len(inconsistent_mappings)}."
    )
    severity = "warning" if hardcoded_tokens or inconsistent_mappings else "info"
    warroom.log(run_id, summary, severity=severity)
    return secretmap_compliance_report


__all__ = ["validate_secret_maps"]
