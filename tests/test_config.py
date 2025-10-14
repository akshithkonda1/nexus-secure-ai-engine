# mypy: ignore-errors

import importlib
import json
import os
from pathlib import Path
import sys

import pytest

MODULE_PATH = Path(__file__).resolve().parents[1] / "nexus" / "ai"
module_dir = str(MODULE_PATH)
if module_dir not in sys.path:
    sys.path.insert(0, module_dir)

nexus_config = importlib.import_module("nexus.ai.nexus_config")


@pytest.fixture(autouse=True)
def clear_env(monkeypatch):
    for key in list(os.environ):
        if key.startswith("NEXUS_"):
            monkeypatch.delenv(key, raising=False)
    yield


def test_load_config_accepts_environment_lists(monkeypatch):
    monkeypatch.setenv("NEXUS_SECRET_PROVIDERS", "aws, azure")
    monkeypatch.setenv("NEXUS_MEMORY_PROVIDERS", '["memory", "aws"]')
    cfg = nexus_config.load_config(paths=[], include_defaults=False)
    assert cfg.secret_providers == ["aws", "azure"]
    assert cfg.memory_providers == ["memory", "aws"]


def test_load_config_rejects_invalid_boolean(monkeypatch):
    monkeypatch.setenv("NEXUS_MEMORY_FANOUT_WRITES", "definitely")
    with pytest.raises(nexus_config.ConfigError):
        nexus_config.load_config(paths=[], include_defaults=False)


def test_load_config_reads_saved_structure(tmp_path):
    config_path = tmp_path / "config.json"
    config_path.write_text(
        json.dumps({"config": {"engine_mode": "direct", "secret_ttl_seconds": 42}})
    )
    cfg = nexus_config.load_config(paths=[str(config_path)], include_defaults=False)
    assert cfg.engine_mode == "direct"
    assert cfg.secret_ttl_seconds == 42


def test_save_config_creates_directories(tmp_path):
    target = tmp_path / "nested" / "nexus_config.json"
    cfg = nexus_config.NexusConfig(engine_mode="direct", memory_fanout_writes=False)
    written = Path(nexus_config.save_config(cfg, str(target)))
    payload = json.loads(written.read_text())
    assert payload["config"]["engine_mode"] == "direct"
    assert payload["config"]["memory_fanout_writes"] is False


def test_secret_overrides_from_environment(monkeypatch):
    monkeypatch.setenv("NEXUS_SECRET_OVERRIDES", '{"SLACK_API_KEY": "secret"}')
    cfg = nexus_config.load_config(paths=[], include_defaults=False)
    assert cfg.secret_overrides == {"SLACK_API_KEY": "secret"}
