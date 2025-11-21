from __future__ import annotations

import argparse
import datetime as dt
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHANGELOG = ROOT / "CHANGELOG.md"


def git_log_range() -> list[str]:
    last_tag_cmd = subprocess.run([
        "git",
        "describe",
        "--tags",
        "--abbrev=0",
    ], capture_output=True, text=True)
    if last_tag_cmd.returncode == 0:
        ref = last_tag_cmd.stdout.strip()
        range_args = [f"{ref}..HEAD"]
    else:
        range_args = []
    log_cmd = ["git", "log", "--no-merges", "--pretty=format:- %s"] + range_args
    output = subprocess.check_output(log_cmd, text=True)
    lines = [line for line in output.splitlines() if line]
    if not lines:
        lines.append("- Changelog initialized")
    return lines


def write_changelog(version: str, entries: list[str]) -> None:
    today = dt.date.today().isoformat()
    header = f"## v{version} - {today}\n"
    body = "\n".join(entries) + "\n"
    if CHANGELOG.exists():
        existing = CHANGELOG.read_text()
    else:
        existing = "# Changelog\n\n"
    new_content = existing + "\n" + header + body
    CHANGELOG.write_text(new_content)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate changelog from git history")
    parser.add_argument("--version", required=True, help="Version string for the release")
    args = parser.parse_args()

    entries = git_log_range()
    write_changelog(args.version, entries)


if __name__ == "__main__":
    main()
