import asyncio
import json
import os
import shutil
import threading
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional, TYPE_CHECKING
import logging

try:
    from nexus.ai.nexus_engine import ENGINE_SCHEMA_VERSION  # type: ignore
except Exception:  # pragma: no cover - fallback when not installed
    ENGINE_SCHEMA_VERSION = "unknown"

if TYPE_CHECKING:  # pragma: no cover
    from nexus.ai.nexus_engine import Engine  # type: ignore

log = logging.getLogger("nexus.engine")


@dataclass
class HealthConfig:
    interval_seconds: int = int(os.getenv("NEXUS_HEALTH_INTERVAL_SEC", "3600"))  # default: 1 hour
    search_probe: str = os.getenv("NEXUS_HEALTH_SEARCH_QUERY", "nexus health check")
    include_memory_check: bool = True


class HealthMonitor:
    def __init__(self, engine: "Engine", interval_seconds: int = 3600, autostart: bool = True):
        self.engine = engine
        self.cfg = HealthConfig(interval_seconds=interval_seconds)
        self._thread: Optional[threading.Thread] = None
        self._stop = threading.Event()
        self._lock = threading.Lock()
        self._last: Dict[str, Any] = {"ts": 0, "ok": False, "components": {}}
        self.is_running = False
        if autostart:
            self.start()

    def start(self) -> None:
        if self.is_running:
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._loop, name="NexusHealthMonitor", daemon=True)
        self._thread.start()
        self.is_running = True
        log.info("Health monitor started (interval=%ss)", self.cfg.interval_seconds)

    def stop(self) -> None:
        if not self.is_running:
            return
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=5.0)
        self.is_running = False
        log.info("Health monitor stopped")

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            return json.loads(json.dumps(self._last))  # deep copy

    async def run_once(self) -> Dict[str, Any]:
        result = await self._compute()
        with self._lock:
            self._last = result
        return result

    def _loop(self) -> None:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        while not self._stop.is_set():
            t0 = time.time()
            try:
                loop.run_until_complete(self.run_once())
            except Exception as e:
                log.warning("health monitor failed: %s", e)
            elapsed = time.time() - t0
            to_sleep = max(10.0, self.cfg.interval_seconds - elapsed)
            self._stop.wait(to_sleep)

    async def _compute(self) -> Dict[str, Any]:
        ts = int(time.time())
        components: Dict[str, Any] = {}
        # Node stats
        components["node"] = self._node_health()
        components["engine"] = {
            "schema_version": ENGINE_SCHEMA_VERSION,
            "instance_schema_version": getattr(self.engine, "schema_version", None),
        }
        # Connectors
        connectors: Dict[str, Any] = {}
        for name, conn in self.engine.connectors.items():
            t0 = time.time()
            degraded = True
            err = None
            try:
                degraded = await asyncio.to_thread(conn.health_check)
            except Exception as e:
                err = str(e)
            connectors[name] = {
                "degraded": bool(degraded),
                "latency_ms": int((time.time() - t0) * 1000),
                "adapter": getattr(conn, "adapter", None),
                "endpoint": getattr(conn, "endpoint", None),
                "error": err,
            }
        components["connectors"] = connectors
        # Web providers probe
        web: Dict[str, Any] = {}
        if self.engine.web:
            for p in self.engine.web.providers:
                t0 = time.time()
                ok = False
                err = None
                enriched = False
                try:
                    results = await p.search(self.cfg.search_probe, k=1, images=False) or []
                    ok = len(results) > 0
                    if ok and self.engine.scraper:
                        _ = await self.engine.scraper.enrich(results[0])
                        enriched = True
                except Exception as e:
                    err = str(e)
                web[p.name] = {
                    "ok": bool(ok),
                    "enriched": bool(enriched),
                    "latency_ms": int((time.time() - t0) * 1000),
                    "error": err,
                }
        components["web"] = web
        # Memory check (non-destructive, encrypted ping)
        mem = {}
        if self.cfg.include_memory_check and self.engine.memory is not None:
            t0 = time.time()
            try:
                sid = "__health__"
                enc = self.engine.crypter.encrypt("__ping__", aad=self.engine._aad(sid))
                await asyncio.to_thread(
                    self.engine.memory.save,
                    self.engine._scoped_session(sid),
                    "system",
                    enc,
                    {"ephemeral": True, "enc": "aesgcm", "ttl_seconds": 300},
                )
                got = await asyncio.to_thread(
                    self.engine.memory.recent, self.engine._scoped_session(sid), limit=1
                )
                mem = {"ok": bool(got), "latency_ms": int((time.time() - t0) * 1000)}
            except Exception as e:
                mem = {"ok": False, "error": str(e)}
        components["memory"] = mem
        ok_overall = self._overall_ok(components)
        return {"ts": ts, "ok": ok_overall, "components": components}

    @staticmethod
    def _overall_ok(components: Dict[str, Any]) -> bool:
        conns = components.get("connectors", {})
        web = components.get("web", {})
        mem = components.get("memory", {"ok": True})
        all_conns_ok = all(not v.get("degraded", True) for v in conns.values()) if conns else True
        any_web_ok = any(v.get("ok") for v in web.values()) if web else True
        mem_ok = bool(mem.get("ok", True))
        return all_conns_ok and any_web_ok and mem_ok

    @staticmethod
    def _node_health() -> Dict[str, Any]:
        info: Dict[str, Any] = {"pid": os.getpid(), "time": int(time.time())}
        try:
            import psutil  # type: ignore

            info["cpu_percent"] = psutil.cpu_percent(interval=0.0)
            vm = psutil.virtual_memory()
            info["memory"] = {
                "total": vm.total,
                "available": vm.available,
                "used": vm.used,
                "percent": vm.percent,
            }
        except Exception:
            info["cpu_percent"] = None
            info["memory"] = {"total": None, "available": None, "used": None, "percent": None}
        try:
            la1, la5, la15 = os.getloadavg()
            info["load"] = {"1": la1, "5": la5, "15": la15}
        except Exception:
            info["load"] = {"1": None, "5": None, "15": None}
        try:
            total, used, free = shutil.disk_usage(os.getcwd())
            info["disk"] = {
                "total": total,
                "used": used,
                "free": free,
                "percent": round(used / total * 100, 2) if total else None,
            }
        except Exception:
            info["disk"] = {"total": None, "used": None, "free": None, "percent": None}
        return info

