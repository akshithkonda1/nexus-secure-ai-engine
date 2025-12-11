"""TestOps master reporter for HTML, JSON, and bundle outputs."""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, Mapping, MutableMapping, Sequence
from zipfile import ZipFile

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = BACKEND_ROOT / "reports" / "master"
TEMPLATE_PATH = BACKEND_ROOT / "reports" / "templates" / "report.html"
SNAPSHOT_DIR = BACKEND_ROOT / "snapshots"
LOG_DIR = BACKEND_ROOT / "logs" / "master"
BUNDLE_DIR = BACKEND_ROOT / "reports" / "bundles"


@dataclass
class ReportArtifacts:
    """Container for generated report artifacts."""

    html_path: Path
    json_path: Path
    snapshot_path: Path
    bundle_path: Path | None = None


class MasterReporter:
    """Generate TestOps artifacts for a single run."""

    def __init__(self, base_dir: Path | None = None) -> None:
        self.base_dir = base_dir or BACKEND_ROOT
        for path in [REPORT_DIR, SNAPSHOT_DIR, LOG_DIR, BUNDLE_DIR, TEMPLATE_PATH.parent]:
            path.mkdir(parents=True, exist_ok=True)

    def _render_latency_svg(self, latencies: Sequence[float]) -> str:
        if not latencies:
            return "<svg width=\"320\" height=\"80\"></svg>"
        max_latency = max(latencies) or 1.0
        points = [
            (
                12 + idx * (296 / max(1, len(latencies) - 1)),
                70 - (min(lat, max_latency) / max_latency) * 60,
            )
            for idx, lat in enumerate(latencies)
        ]
        path = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in points)
        return (
            "<svg width=\"320\" height=\"80\" viewBox=\"0 0 320 80\" "
            "xmlns=\"http://www.w3.org/2000/svg\">"
            "<rect width=\"320\" height=\"80\" rx=\"10\" fill=\"#0f172a\"/>"
            f"<path d='{path}' stroke=\"#22d3ee\" stroke-width=\"2\" fill=\"none\"/>"
            "</svg>"
        )

    def _load_template(self) -> str:
        if not TEMPLATE_PATH.exists():
            raise FileNotFoundError(f"Missing report template at {TEMPLATE_PATH}")
        return TEMPLATE_PATH.read_text(encoding="utf-8")

    def build_snapshot_payload(
        self,
        run_id: str,
        summary: Mapping[str, object],
        modules: Iterable[Mapping[str, object]],
        artifacts: Mapping[str, str] | None = None,
    ) -> Dict[str, object]:
        base: MutableMapping[str, object] = {
            "run_id": run_id,
            "status": summary.get("status"),
            "started_at": summary.get("started_at"),
            "finished_at": summary.get("finished_at"),
            "modules": [dict(m) for m in modules],
        }
        if artifacts:
            base["artifacts"] = dict(artifacts)
        return dict(base)

    def write_json_report(self, run_id: str, payload: Mapping[str, object]) -> Path:
        json_path = REPORT_DIR / f"report_{run_id}.json"
        json_path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
        return json_path

    def write_snapshot(self, run_id: str, payload: Mapping[str, object]) -> Path:
        snapshot_path = SNAPSHOT_DIR / f"{run_id}.json"
        snapshot_path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
        return snapshot_path

    def write_html_report(
        self,
        run_id: str,
        summary: Mapping[str, object],
        modules: Iterable[Mapping[str, object]],
        diagnostics: Mapping[str, object] | None = None,
    ) -> Path:
        diagnostics = diagnostics or {}
        template = self._load_template()
        module_rows = "\n".join(
            f"<tr><td>{m.get('name')}</td><td class=\"{str(m.get('status','')).lower()}\">{m.get('status')}</td>"
            f"<td><pre>{json.dumps(m.get('metrics', {}), indent=2)}</pre></td>"
            f"<td>{' | '.join(m.get('notes', []))}</td></tr>"
            for m in modules
        )
        latency_svg = self._render_latency_svg(diagnostics.get("latencies", []))
        determinism = diagnostics.get("determinism_score")
        html = template.format(
            run_id=run_id,
            status=summary.get("status", "UNKNOWN"),
            status_class=str(summary.get("status", "unknown")).lower(),
            started_at=summary.get("started_at", ""),
            finished_at=summary.get("finished_at", ""),
            module_rows=module_rows,
            latency_chart=latency_svg,
            determinism_score=f"{determinism:.2f}" if isinstance(determinism, (int, float)) else "N/A",
            snapshot_json=json.dumps(diagnostics.get("snapshot", {}), indent=2),
        )
        html_path = REPORT_DIR / f"report_{run_id}.html"
        html_path.write_text(html, encoding="utf-8")
        return html_path

    def bundle(
        self,
        run_id: str,
        artifacts: Mapping[str, Path],
        include_report: ReportArtifacts | None = None,
    ) -> Path:
        required = ["logs", "snapshot", "sim_data", "load_data", "determinism"]
        for key in required:
            if key not in artifacts:
                raise KeyError(f"Missing required artifact '{key}' for bundling")
            if not artifacts[key].exists():
                raise FileNotFoundError(f"Artifact for {key} not found: {artifacts[key]}")
        bundle_path = BUNDLE_DIR / f"testops_bundle_{run_id}.zip"
        with ZipFile(bundle_path, "w") as zf:
            zf.write(artifacts["logs"], arcname=f"logs/{artifacts['logs'].name}")
            zf.write(artifacts["snapshot"], arcname=f"snapshot/{artifacts['snapshot'].name}")
            zf.write(artifacts["sim_data"], arcname=f"sim/{artifacts['sim_data'].name}")
            zf.write(artifacts["load_data"], arcname=f"load/{artifacts['load_data'].name}")
            zf.write(artifacts["determinism"], arcname=f"determinism/{artifacts['determinism'].name}")
            if include_report:
                zf.write(include_report.html_path, arcname=f"reports/{include_report.html_path.name}")
                zf.write(include_report.json_path, arcname=f"reports/{include_report.json_path.name}")
                zf.write(include_report.snapshot_path, arcname=f"reports/{include_report.snapshot_path.name}")
        return bundle_path

    def build_all(
        self,
        run_id: str,
        summary: Mapping[str, object],
        modules: Iterable[Mapping[str, object]],
        diagnostics: Mapping[str, object],
        logs_path: Path,
    ) -> ReportArtifacts:
        if not logs_path.exists():
            raise FileNotFoundError(f"Log path does not exist for bundling: {logs_path}")
        snapshot_payload = self.build_snapshot_payload(
            run_id,
            summary=summary,
            modules=modules,
            artifacts=diagnostics.get("artifacts", {}),
        )
        json_path = self.write_json_report(run_id, diagnostics)
        snapshot_path = self.write_snapshot(run_id, snapshot_payload)
        html_path = self.write_html_report(
            run_id,
            summary=summary,
            modules=modules,
            diagnostics={"latencies": diagnostics.get("latencies", []), "determinism_score": diagnostics.get("determinism_score"), "snapshot": snapshot_payload},
        )
        bundle_path = None
        extra_paths = diagnostics.get("artifacts") or {}
        expected_keys = {"sim_data", "load_data", "determinism"}
        if expected_keys.issubset(extra_paths):
            artifacts: Dict[str, Path] = {
                "logs": logs_path,
                "snapshot": snapshot_path,
                "sim_data": Path(extra_paths["sim_data"]),
                "load_data": Path(extra_paths["load_data"]),
                "determinism": Path(extra_paths["determinism"]),
            }
            bundle_path = self.bundle(run_id, artifacts, ReportArtifacts(html_path, json_path, snapshot_path))
        return ReportArtifacts(html_path=html_path, json_path=json_path, snapshot_path=snapshot_path, bundle_path=bundle_path)


def timestamp() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


__all__ = ["MasterReporter", "ReportArtifacts", "timestamp"]
