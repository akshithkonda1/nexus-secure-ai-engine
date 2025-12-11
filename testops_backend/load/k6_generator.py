from pathlib import Path
from testops_backend.core.config import LOAD_DIR


def generate_k6_script(target: int) -> str:
    template_path = LOAD_DIR / "k6_template.js"
    template = template_path.read_text(encoding="utf-8")
    return template.replace("__TARGET__", str(target))
