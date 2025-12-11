"""ZIP bundle creator for TestOps Wave 3."""
from __future__ import annotations

from pathlib import Path
from typing import Mapping
from zipfile import ZipFile

REPORT_ROOT = Path(__file__).resolve().parents[2] / "reports"


def _validate_paths(paths: Mapping[str, Path]) -> None:
    missing = [key for key, value in paths.items() if not Path(value).exists()]
    if missing:
        raise FileNotFoundError(f"Missing artifacts for bundling: {', '.join(missing)}")


def create_bundle(run_id: str, artifacts: Mapping[str, Path]) -> Path:
    """Create a bundle.zip under reports/<run_id>/ with required artifacts."""
    run_dir = REPORT_ROOT / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    bundle_path = run_dir / "bundle.zip"
    normalized = {key: Path(path) for key, path in artifacts.items()}
    _validate_paths(normalized)

    with ZipFile(bundle_path, "w") as zf:
        zf.write(normalized["json_report"], arcname="report.json")
        zf.write(normalized["html_report"], arcname="report.html")
        zf.write(normalized["logs"], arcname=f"logs/{Path(normalized['logs']).name}")
        zf.write(normalized["snapshot"], arcname="snapshot.json")
        zf.write(normalized["sim_summary"], arcname="sim_summary.json")
        zf.write(normalized["load_summary"], arcname="load_summary.json")
        zf.write(normalized["replay_summary"], arcname="replay_summary.json")
    return bundle_path


__all__ = ["create_bundle"]
