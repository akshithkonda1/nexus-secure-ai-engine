import json
import zipfile
from pathlib import Path
from typing import Dict

from testops_backend.core.config import LOG_DIR, REPORT_DIR, SNAPSHOT_DIR


DEFAULT_BUNDLE = REPORT_DIR / "testops_report_bundle.zip"


def _add_dir(zip_handle: zipfile.ZipFile, directory: Path, arc_prefix: str) -> None:
    if not directory.exists():
        return
    for item in directory.iterdir():
        if item.is_file():
            zip_handle.write(item, arcname=f"{arc_prefix}/{item.name}")


def build_bundle(report_path: Path, extra_metrics: Dict | None = None, bundle_path: Path | None = None) -> Path:
    bundle_path = bundle_path or DEFAULT_BUNDLE
    bundle_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(bundle_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.write(report_path, arcname=report_path.name)
        _add_dir(zf, LOG_DIR, "logs")
        _add_dir(zf, SNAPSHOT_DIR, "snapshots")
        metrics_path = REPORT_DIR / "metrics.json"
        metrics_path.write_text(json.dumps(extra_metrics or {}, indent=2), encoding="utf-8")
        zf.write(metrics_path, arcname="metrics/metrics.json")
    return bundle_path
