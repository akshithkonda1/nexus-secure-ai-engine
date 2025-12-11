import json
from pathlib import Path
from string import Template
from typing import Dict

from testops_backend.core.config import REPORT_DIR


def build_json_report(summary: Dict, name: str = "report.json") -> Path:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORT_DIR / name
    path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return path


def build_html_report(summary: Dict, name: str = "report.html") -> Path:
    template_path = Path(__file__).parent / "html_template.html"
    template = Template(template_path.read_text(encoding="utf-8"))
    content = template.safe_substitute(title="TestOps Summary", summary_json=json.dumps(summary, indent=2))
    path = REPORT_DIR / name
    path.write_text(content, encoding="utf-8")
    return path
