from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
import tomllib
import yaml

ROOT = Path(__file__).resolve().parent.parent
VERSION_FILE = ROOT / "VERSION"
OPENAPI_YAML = ROOT / "docs" / "openapi.yaml"
OPENAPI_JSON = ROOT / "docs" / "openapi.json"


def read_version() -> str:
    if VERSION_FILE.exists():
        return VERSION_FILE.read_text().strip()
    pyproject = ROOT / "pyproject.toml"
    data = tomllib.loads(pyproject.read_text())
    project = data.get("project") or {}
    version = project.get("version")
    if not version:
        raise ValueError("Version not found in VERSION or pyproject.toml")
    return str(version)


def bump(version: str, bump_type: str) -> str:
    major, minor, patch = map(int, version.split("."))
    if bump_type == "major":
        major += 1
        minor = 0
        patch = 0
    elif bump_type == "minor":
        minor += 1
        patch = 0
    else:
        patch += 1
    return f"{major}.{minor}.{patch}"


def update_openapi(version: str) -> None:
    if not OPENAPI_YAML.exists():
        return
    text = OPENAPI_YAML.read_text()
    updated = re.sub(r"version: \"?\d+\.\d+\.\d+\"?", f"version: {version}", text)
    OPENAPI_YAML.write_text(updated)
    parsed = yaml.safe_load(updated)
    parsed["info"]["version"] = version
    OPENAPI_JSON.write_text(json.dumps(parsed, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Bump semantic version and sync OpenAPI docs.")
    parser.add_argument("--type", choices=["major", "minor", "patch"], help="Increment type")
    parser.add_argument("--current", action="store_true", help="Print current version and exit")
    args = parser.parse_args()

    current = read_version()
    if args.current:
        print(current)
        return

    bump_type = args.type or "patch"
    new_version = bump(current, bump_type)
    VERSION_FILE.write_text(new_version + "\n")
    update_openapi(new_version)
    print(new_version)


if __name__ == "__main__":
    main()
