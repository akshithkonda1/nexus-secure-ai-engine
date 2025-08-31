from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Tuple, Optional
from pathlib import Path
import os, json

# Pure, side-effect free

@dataclass
class NexusConfig:
    engine_mode: str = "mixed"  # delegates|direct|mixed
    routing_policy: str = "reliability_weighted"  # reliability_weighted|round_robin|first_good
    secret_providers: List[str] = field(default_factory=lambda: ["aws"])  # aws|azure|gcp
    secret_overrides: Dict[str, str] = field(default_factory=dict)
    secret_ttl_seconds: int = 600
    memory_providers: List[str] = field(default_factory=lambda: ["memory"])  # aws|azure|gcp|memory
    memory_fanout_writes: bool = True
    require_any_connector: bool = False
    max_context_messages: int = 12
    alpha_semantic: float = 0.7
    encrypt: bool = True

def _base_dir() -> Path:
    env = os.getenv("NEXUS_CONFIG_DIR")
    if env: return Path(env)
    try:
        if "__file__" in globals():
            return Path(__file__).resolve().parent
    except Exception:
        pass
    return Path.cwd()

def _read_json(path: Path) -> Dict:
    if not path.exists(): return {}
    return json.loads(path.read_text("utf-8"))

def load_config(paths: Optional[List[str]] = None, env_prefix: str = "NEXUS_") -> NexusConfig:
    data: Dict = {}
    for p in (paths or []):
        data |= _read_json(Path(p))

    def gv(key: str, default):
        node = data
        for part in key.split("."):
            if isinstance(node, dict) and part in node:
                node = node[part]
            else:
                node = None; break
        return node if node is not None else default

    def ge(key: str, default):
        ev = os.getenv(env_prefix + key.replace(".", "_").upper())
        return ev if ev is not None else gv(key, default)

    return NexusConfig(
        engine_mode=ge("engine_mode", "mixed"),
        routing_policy=ge("routing_policy", "reliability_weighted"),
        secret_providers=[s.strip().lower() for s in (ge("secret_providers", ["aws"]) or [])],
        secret_overrides=ge("secret_overrides", {}) or {},
        secret_ttl_seconds=int(ge("secret_ttl_seconds", 600)),
        memory_providers=[m.strip().lower() for m in (ge("memory_providers", ["memory"]) or [])],
        memory_fanout_writes=str(ge("memory_fanout_writes", "true")).strip().lower() in {"1","true","yes","y","on"},
        require_any_connector=str(ge("require_any_connector", "false")).strip().lower() in {"1","true","yes","y","on"},
        max_context_messages=int(ge("max_context_messages", 12)),
        alpha_semantic=float(ge("alpha_semantic", 0.7)),
        encrypt=str(ge("encrypt", "true")).strip().lower() in {"1","true","yes","y","on"},
    )

def validate_config(cfg: NexusConfig) -> List[str]:
    errs: List[str] = []
    if cfg.engine_mode not in {"delegates","direct","mixed"}:
        errs.append("engine_mode must be delegates|direct|mixed")
    if cfg.routing_policy not in {"reliability_weighted","round_robin","first_good"}:
        errs.append("routing_policy invalid")
    if not cfg.secret_providers: errs.append("secret_providers must not be empty")
    for p in cfg.secret_providers:
        if p not in {"aws","azure","gcp"}: errs.append(f"unknown secret provider: {p}")
    for m in cfg.memory_providers:
        if m not in {"aws","azure","gcp","memory"}: errs.append(f"unknown memory provider: {m}")
    if not (0.0 <= cfg.alpha_semantic <= 1.0): errs.append("alpha_semantic must be in [0,1]")
    if cfg.max_context_messages < 1: errs.append("max_context_messages must be >= 1")
    hints = {
        "has_delegate": any(k.endswith("_DELEGATE") for k in cfg.secret_overrides),
        "has_endpoint": any(k.endswith("_ENDPOINT") for k in cfg.secret_overrides),
        "has_keys": any(k.endswith("_API_KEY") for k in cfg.secret_overrides),
    }
    if cfg.require_any_connector and not (hints["has_delegate"] or (hints["has_endpoint"] and hints["has_keys"])):
        errs.append("no connectors configured per engine_mode; add *_DELEGATE or *_ENDPOINT + *_API_KEY")
    return errs

def save_config(cfg: NexusConfig, path: Optional[str] = None) -> str:
    out = Path(path or (_base_dir() / "nexus_config.json"))
    out.write_text(json.dumps({"config": asdict(cfg)}, indent=2), encoding="utf-8")
    return str(out)

def load_and_validate(paths: Optional[List[str]] = None, env_prefix: str = "NEXUS_") -> Tuple[NexusConfig, List[str]]:
    cfg = load_config(paths, env_prefix)
    return cfg, validate_config(cfg)
