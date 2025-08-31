from __future__ import annotations
import sys, os, json
from pathlib import Path
from config import NexusConfig, save_config

def _input(prompt: str, default: str = "") -> str:
    try:
        v = input(f"{prompt}{f' [{default}]' if default else ''}: ").strip()
        return v or default
    except Exception:
        return default

def main():
    name = _input("Your name", os.getenv("NEXUS_USER_NAME", "user"))
    age  = _input("Your age", os.getenv("NEXUS_USER_AGE", "12"))
    try:
        if int(age) < 10:
            print(f"Sorry {name}, you must be 10 or older."); sys.exit(1)
    except Exception:
        print("Invalid age"); sys.exit(1)

    clouds = _input("Clouds (comma: aws,azure,gcp)", os.getenv("NEXUS_CLOUDS", "aws"))
    secret_providers = [c.strip().lower() for c in clouds.split(",") if c.strip()]
    memory_providers = secret_providers or ["memory"]

    mode = _input("Engine mode (delegates|direct|mixed)", os.getenv("NEXUS_ENGINE_MODE", "mixed")).lower()
    routing = _input("Routing policy (reliability_weighted|round_robin|first_good)",
                     os.getenv("NEXUS_ROUTING_POLICY", "reliability_weighted")).lower()

    secret_overrides = {}
    # Minimal prompts; can be expanded per provider as needed
    if mode in {"direct","mixed"}:
        gpt_ep = _input("GPT HTTPS endpoint (optional)", os.getenv("GPT_ENDPOINT",""))
        if gpt_ep: secret_overrides["GPT_ENDPOINT"] = gpt_ep
        openai_key = _input("OPENAI_API_KEY secret id/value (optional)", os.getenv("OPENAI_API_KEY",""))
        if openai_key: secret_overrides["OPENAI_API_KEY"] = openai_key

    if mode in {"delegates","mixed"}:
        gpt_del = _input("GPT delegate (e.g., aws:lambda:fn@us-east-1 | gcp:run:https://...)", os.getenv("NEXUS_SECRET_GPT_DELEGATE",""))
        if gpt_del: secret_overrides["NEXUS_SECRET_GPT_DELEGATE"] = gpt_del

    cfg = NexusConfig(
        engine_mode=mode,
        routing_policy=routing,
        secret_providers=secret_providers or ["aws"],
        secret_overrides=secret_overrides,
        secret_ttl_seconds=int(os.getenv("NEXUS_SECRET_TTL","600")),
        memory_providers=memory_providers or ["memory"],
        memory_fanout_writes=True,
        require_any_connector=True,
        max_context_messages=int(os.getenv("NEXUS_MAX_CTX","12")),
        alpha_semantic=float(os.getenv("NEXUS_ALPHA","0.7")),
        encrypt=os.getenv("NEXUS_ENCRYPT","1") not in {"0","false","no"},
    )

    path = save_config(cfg, os.getenv("NEXUS_CONFIG_PATH"))
    print(f"Saved config -> {path}")

if __name__ == "__main__":
    # non-interactive fallback
    if not sys.stdin or not sys.stdin.isatty():
        os.environ.setdefault("NEXUS_USER_NAME","user")
        os.environ.setdefault("NEXUS_USER_AGE","12")
    main()
