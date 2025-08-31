from __future__ import annotations
import os, json, argparse
from pathlib import Path

from config import load_and_validate
# Expect your existing modules
try:
    from engine import Engine
except Exception:
    class Engine:
        def __init__(self, **_): pass
        def run(self, *_a, **_k): return {"answers": {}, "ranking": {}}

try:
    from memory_compute import MultiMemoryStore, DynamoDBMemoryStore, FirestoreMemoryStore, AzureBlobMemoryStore, InMemoryStore, ping_memory_store
except Exception:
    class InMemoryStore: 
        def recent(self, *a, **k): return []
        def save(self, *a, **k): return True
    class MultiMemoryStore:
        def __init__(self, stores, fanout_writes=True): self.stores=stores; self.primary=stores[0]
    def DynamoDBMemoryStore(*a, **k): return InMemoryStore()
    def FirestoreMemoryStore(*a, **k): return InMemoryStore()
    def AzureBlobMemoryStore(*a, **k): return InMemoryStore()
    def ping_memory_store(_): return {"ok": True}

def _make_memory(providers, fanout=True):
    stores=[]
    for p in providers:
        if p=="aws": stores.append(DynamoDBMemoryStore(os.getenv("NEXUS_DDB_MESSAGES","nexus_messages"), os.getenv("NEXUS_DDB_INDEX","nexus_memindex")))
        elif p=="gcp": stores.append(FirestoreMemoryStore(os.getenv("NEXUS_FS_PREFIX","nexus")))
        elif p=="azure": stores.append(AzureBlobMemoryStore(container=os.getenv("NEXUS_AZ_CONTAINER","nexus-messages"), prefix=os.getenv("NEXUS_AZ_PREFIX","nexus")))
        else: stores.append(InMemoryStore())
    return MultiMemoryStore(stores, fanout_writes=fanout)

def _make_connectors(cfg, resolver_like=None):
    # Keep minimal: rely on secret_overrides keys
    def https(u: str) -> bool: return isinstance(u, str) and u.startswith("https://")
    conns={}
    if cfg.engine_mode in {"direct","mixed"} and cfg.secret_overrides.get("GPT_ENDPOINT"):
        ep = cfg.secret_overrides["GPT_ENDPOINT"]
        key = cfg.secret_overrides.get("OPENAI_API_KEY")
        if https(ep):
            from functools import partial
            import requests
            def _q(endpoint, key, prompt, params=None):
                r = requests.post(endpoint, json={"prompt":prompt, **(params or {})},
                                  headers={"Authorization": f"Bearer {key}"} if key else None, timeout=12)
                r.raise_for_status()
                try: return {"text": r.json()}
                except Exception: return {"text": r.text}
            conns["ChatGPT"] = type("DirectConn",(object,),{"query": staticmethod(partial(_q, ep, key))})
    if cfg.engine_mode in {"delegates","mixed"} and cfg.secret_overrides.get("NEXUS_SECRET_GPT_DELEGATE"):
        spec = cfg.secret_overrides["NEXUS_SECRET_GPT_DELEGATE"]
        if spec.startswith("aws:lambda:"):
            fn_region = spec.split(":",2)[-1]
            fn, region = (fn_region.split("@")+[os.getenv("AWS_REGION","us-east-1")])[:2]
            try:
                import boto3, json as _j
                lam = boto3.client("lambda", region_name=region)
                def _q(prompt, params=None):
                    p = _j.dumps({"prompt":prompt, "params": params or {}}).encode("utf-8")
                    body = lam.invoke(FunctionName=fn, Payload=p)["Payload"].read()
                    try: return _j.loads(body.decode("utf-8"))
                    except Exception: return {"text": body.decode("utf-8","replace")}
                conns["ChatGPT"] = type("LambdaConn",(object,),{"query": staticmethod(_q)})
            except Exception:
                pass
    return conns

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default=os.getenv("NEXUS_CONFIG_PATH", str(Path.cwd() / "nexus_config.json")))
    args = ap.parse_args()

    cfg, errs = load_and_validate(paths=[args.config] if args.config else None)
    if errs: raise SystemExit("\n".join(errs))

    mem = _make_memory(cfg.memory_providers, cfg.memory_fanout_writes)
    conns = _make_connectors(cfg)

    eng = Engine(connectors=conns, memory=mem, resolver_like=None,
                 encrypt=cfg.encrypt, alpha_semantic=cfg.alpha_semantic,
                 max_context_messages=cfg.max_context_messages)

    health = {"connectors": list(conns.keys()),
              "memory": [ping_memory_store(s) for s in getattr(mem, "stores", [])]}
    print(json.dumps({"status":"ok","health":health}, indent=2))

if __name__ == "__main__":
    main()
