# memory_compute.py
from __future__ import annotations

import json
import logging
import os
import shutil
import socket
import time
import uuid
from functools import lru_cache
from typing import Any, Dict, Iterable, List, Optional, Tuple

# ---------- Logging ----------
_LOG_LEVEL = os.getenv("NEXUS_LOG_LEVEL", "INFO").upper()
logger = logging.getLogger("nexus.memory")
if not logger.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(
        logging.Formatter(
            '{"ts":"%(asctime)s","lvl":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}'
        )
    )
    logger.addHandler(_h)
logger.setLevel(getattr(logging, _LOG_LEVEL, logging.INFO))


# ---------- Errors & helpers ----------


class MemoryStoreError(RuntimeError):
    """Raised when a backing memory store is misconfigured or unhealthy."""


def _assert_positive(value: int, name: str) -> int:
    if value <= 0:
        raise MemoryStoreError(f"{name} must be a positive integer (got {value})")
    return value


@lru_cache(maxsize=1)
def _ttl_seconds() -> int:
    """Resolve the TTL for ephemeral records, validating the environment override."""
    raw_env = os.getenv("NEXUS_MEM_TTL_SECONDS", "3600")
    raw = (raw_env if raw_env is not None else "3600").strip()
    if not raw:
        raise MemoryStoreError("NEXUS_MEM_TTL_SECONDS cannot be empty")
    try:
        ttl = int(raw)
    except ValueError as exc:
        raise MemoryStoreError("NEXUS_MEM_TTL_SECONDS must be an integer") from exc
    return _assert_positive(ttl, "NEXUS_MEM_TTL_SECONDS")


def _now_ms() -> int:
    return int(time.time() * 1000)


def _meta_dict(meta: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if meta is None:
        return {}
    if not isinstance(meta, dict):
        raise MemoryStoreError("meta payloads must be dictionaries")
    return dict(meta)


def _copy_meta(meta: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    payload = _meta_dict(meta)
    try:
        json.dumps(payload, ensure_ascii=False)
    except TypeError as exc:
        raise MemoryStoreError("meta payloads must be JSON serialisable") from exc
    return payload


def _normalize_limit(limit: int) -> int:
    try:
        lim = int(limit)
    except (TypeError, ValueError):
        raise MemoryStoreError("limit must be an integer")
    return _assert_positive(lim, "limit")


# ---------- Base ----------
class MemoryStore:
    """Abstract interface for chat history storage backends."""

    def save(
        self, session_id: str, role: str, text: str, meta: Optional[Dict[str, Any]] = None
    ) -> str:
        raise NotImplementedError

    def recent(self, session_id: str, limit: int = 8) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def ping(self) -> Dict[str, Any]:
        """Write/read a tiny probe to verify basic liveness."""
        sid = f"__ping__{uuid.uuid4().hex[:8]}"
        mid = self.save(sid, "system", "__ping__", {"ephemeral": True})
        got = self.recent(sid, limit=1)
        ok = bool(got)
        logger.debug(f"ping backend={self.__class__.__name__} ok={ok}")
        return {"ok": ok, "mid": mid, "backend": self.__class__.__name__}


# ---------- In-memory ----------
class InMemoryStore(MemoryStore):
    """Volatile in-process store for development/testing."""

    def __init__(self):
        self._data: Dict[str, List[Dict[str, Any]]] = {}
        logger.info("InMemoryStore initialized")

    def save(
        self, session_id: str, role: str, text: str, meta: Optional[Dict[str, Any]] = None
    ) -> str:
        mid = uuid.uuid4().hex
        ts = _now_ms()
        payload = _copy_meta(meta)
        self._data.setdefault(session_id, []).append(
            {
                "id": mid,
                "ts": ts,
                "role": role,
                "text": text,
                "meta": payload,
            }
        )
        logger.debug(f"InMemoryStore.save session={session_id} role={role} mid={mid}")
        return mid

    def recent(self, session_id: str, limit: int = 8) -> List[Dict[str, Any]]:
        lim = _normalize_limit(limit)
        msgs = self._data.get(session_id, [])
        msgs = sorted(msgs, key=lambda x: x["ts"])[-lim:]
        logger.debug(f"InMemoryStore.recent session={session_id} count={len(msgs)}")
        return [{"role": m["role"], "text": m["text"], "ts": m["ts"]} for m in msgs]


# ---------- AWS DynamoDB ----------
class DynamoDBMemoryStore(MemoryStore):
    """Durable store on AWS DynamoDB (PK: session_id, sort: ts)."""

    def __init__(
        self, table_name: str, index_name: Optional[str] = None, region_name: Optional[str] = None
    ):
        try:
            import boto3
            from boto3.dynamodb.conditions import Key  # noqa: F401
        except Exception as e:
            logger.error("boto3 import failed for DynamoDBMemoryStore")
            raise ImportError("boto3 is required for DynamoDBMemoryStore") from e
        self._boto3 = boto3
        self._Key = Key
        self._region = region_name or os.getenv("AWS_REGION", "us-east-1")
        self._table = self._boto3.resource("dynamodb", region_name=self._region).Table(table_name)
        self._gsi = index_name
        logger.info(
            f"DynamoDBMemoryStore initialized table={table_name} region={self._region} gsi={index_name or '-'}"
        )

    def save(
        self, session_id: str, role: str, text: str, meta: Optional[Dict[str, Any]] = None
    ) -> str:
        mid = uuid.uuid4().hex
        ts = _now_ms()
        payload = _copy_meta(meta)
        item: Dict[str, Any] = {
            "session_id": session_id,
            "ts": ts,
            "id": mid,
            "role": role,
            "text": text,
        }
        if payload:
            item["meta_json"] = json.dumps(payload, ensure_ascii=False)
            if payload.get("ephemeral"):
                item["ttl"] = int(time.time()) + _ttl_seconds()
        self._table.put_item(Item=item)
        logger.debug(f"DynamoDB.save session={session_id} role={role} mid={mid}")
        return mid

    def recent(self, session_id: str, limit: int = 8) -> List[Dict[str, Any]]:
        lim = _normalize_limit(limit)
        qargs: Dict[str, Any] = {
            "KeyConditionExpression": self._Key("session_id").eq(session_id),
            "Limit": lim,
            "ScanIndexForward": False,
        }
        if self._gsi:
            qargs["IndexName"] = self._gsi
        resp = self._table.query(**qargs)
        items = resp.get("Items", [])
        items.sort(key=lambda x: x.get("ts", 0))
        out = [
            {"role": it.get("role", ""), "text": it.get("text", ""), "ts": it.get("ts", 0)}
            for it in items[-lim:]
        ]
        logger.debug(f"DynamoDB.recent session={session_id} count={len(out)}")
        return out


# ---------- GCP Firestore ----------
class FirestoreMemoryStore(MemoryStore):
    """Durable store on GCP Firestore (per-session subcollection)."""

    def __init__(self, prefix: str = "nexus"):
        try:
            from google.cloud import firestore
        except Exception as e:
            logger.error("google-cloud-firestore import failed for FirestoreMemoryStore")
            raise ImportError("google-cloud-firestore is required for FirestoreMemoryStore") from e
        self._fs = firestore.Client()
        self._col = f"{prefix}_sessions"
        logger.info(f"FirestoreMemoryStore initialized collection_prefix={self._col}")

    def save(
        self, session_id: str, role: str, text: str, meta: Optional[Dict[str, Any]] = None
    ) -> str:
        mid = uuid.uuid4().hex
        ts = _now_ms()
        payload: Dict[str, Any] = {
            "id": mid,
            "ts": ts,
            "role": role,
            "text": text,
            "meta": _copy_meta(meta),
        }
        if payload["meta"].get("ephemeral"):
            payload["ttl"] = int(time.time()) + _ttl_seconds()
        self._fs.collection(self._col).document(session_id).collection("messages").document(
            mid
        ).set(payload)
        logger.debug(f"Firestore.save session={session_id} role={role} mid={mid}")
        return mid

    def recent(self, session_id: str, limit: int = 8) -> List[Dict[str, Any]]:
        lim = _normalize_limit(limit)
        msgs_ref = (
            self._fs.collection(self._col)
            .document(session_id)
            .collection("messages")
            .order_by("ts", direction="DESCENDING")
            .limit(lim)
        )
        msgs = [d.to_dict() for d in msgs_ref.stream()]
        msgs = list(reversed(msgs))
        out = [
            {"role": m.get("role", ""), "text": m.get("text", ""), "ts": m.get("ts", 0)}
            for m in msgs
        ]
        logger.debug(f"Firestore.recent session={session_id} count={len(out)}")
        return out


# ---------- Azure Blob ----------
class AzureBlobMemoryStore(MemoryStore):
    """Durable store on Azure Blob Storage (one JSONL per session)."""

    def __init__(
        self, container: str, prefix: str = "nexus", connection_string: Optional[str] = None
    ):
        try:
            from azure.storage.blob import BlobServiceClient  # noqa: F401
        except Exception as e:
            logger.error("azure-storage-blob import failed for AzureBlobMemoryStore")
            raise ImportError("azure-storage-blob is required for AzureBlobMemoryStore") from e
        conn = connection_string or os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        if not conn:
            raise RuntimeError(
                "AZURE_STORAGE_CONNECTION_STRING is required for AzureBlobMemoryStore"
            )
        self._svc = BlobServiceClient.from_connection_string(conn)
        self._container = container
        self._prefix = prefix
        try:
            self._svc.create_container(container)
            logger.info(f"AzureBlobMemoryStore created container={container}")
        except Exception:
            logger.info(f"AzureBlobMemoryStore using existing container={container}")

    def _blob(self, session_id: str):
        name = f"{self._prefix}/{session_id}.jsonl"
        return self._svc.get_blob_client(container=self._container, blob=name)

    def save(
        self, session_id: str, role: str, text: str, meta: Optional[Dict[str, Any]] = None
    ) -> str:
        mid = uuid.uuid4().hex
        ts = _now_ms()
        payload = {"id": mid, "ts": ts, "role": role, "text": text, "meta": _copy_meta(meta)}
        if payload["meta"].get("ephemeral"):
            payload["ttl"] = int(time.time()) + _ttl_seconds()
        line = (json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8")
        bc = self._blob(session_id)
        try:
            try:
                bc.create_append_blob()
            except Exception:
                pass
            bc.append_block(line)
            logger.debug(f"AzureBlob.append session={session_id} mid={mid}")
        except Exception as e:
            logger.warning(f"Azure append failed; falling back to overwrite. err={e}")
            old = b""
            try:
                old = bc.download_blob(max_concurrency=1).readall()
            except Exception:
                pass
            bc.upload_blob(old + line, overwrite=True)
        return mid

    def recent(self, session_id: str, limit: int = 8) -> List[Dict[str, Any]]:
        lim = _normalize_limit(limit)
        bc = self._blob(session_id)
        try:
            raw = bc.download_blob(max_concurrency=1).readall().decode("utf-8")
        except Exception:
            logger.debug(f"AzureBlob.recent session={session_id} empty")
            return []
        lines = [l for l in raw.splitlines() if l.strip()]
        out: List[Dict[str, Any]] = []
        for l in lines[-lim:]:
            try:
                m = json.loads(l)
                out.append(
                    {"role": m.get("role", ""), "text": m.get("text", ""), "ts": m.get("ts", 0)}
                )
            except Exception:
                continue
        logger.debug(f"AzureBlob.recent session={session_id} count={len(out)}")
        return out


# ---------- Multi-store ----------
class MultiMemoryStore:
    """Orchestrates multiple stores: read-primary, fan-out writes."""

    def __init__(self, stores: Iterable[MemoryStore], fanout_writes: bool = True):
        resolved = [s for s in (stores or []) if s is not None]
        if not resolved:
            resolved = [InMemoryStore()]
        for s in resolved:
            if not isinstance(s, MemoryStore):
                raise MemoryStoreError("All stores must inherit from MemoryStore")
        self.stores = resolved
        self.fanout = bool(fanout_writes)
        logger.info(
            "MultiMemoryStore initialized providers=%s fanout=%s",
            [s.__class__.__name__ for s in self.stores],
            self.fanout,
        )

    @property
    def primary(self) -> MemoryStore:
        return self.stores[0]

    def save(self, session_id: str, role: str, text: str, meta: Optional[Dict[str, Any]] = None) -> str:
        payload = _copy_meta(meta)
        ids: List[str] = []
        errors: List[str] = []
        for i, s in enumerate(self.stores):
            try:
                mid = s.save(session_id, role, text, dict(payload))
                ids.append(mid)
                if not self.fanout:
                    break
            except Exception as e:
                err = f"write failed backend={s.__class__.__name__} err={e}"
                errors.append(err)
                logger.warning(err)
                continue
        ok = bool(ids)
        if not ok:
            raise MemoryStoreError(
                f"Failed to persist message for session {session_id}; attempted {len(self.stores)} stores",
            )
        if errors:
            logger.debug("MultiMemoryStore.save partial failures=%s", errors)
        logger.debug(f"MultiMemoryStore.save session={session_id} wrote={len(ids)} ok={ok}")
        return ids[0] if ids else ""

    def recent(self, session_id: str, limit: int = 8) -> List[Dict[str, Any]]:
        lim = _normalize_limit(limit)
        try:
            out = self.primary.recent(session_id, lim)
            logger.debug(
                f"MultiMemoryStore.recent primary={self.primary.__class__.__name__} count={len(out)}"
            )
            logger.debug(f"MultiMemoryStore.recent primary={self.primary.__class__.__name__} count={len(out)}")
            return out
        except Exception as e:
            logger.warning(f"primary recent failed; trying fallbacks err={e}")
            for s in self.stores[1:]:
                try:
                    out = s.recent(session_id, lim)
                    logger.debug(
                        f"MultiMemoryStore.recent fallback={s.__class__.__name__} count={len(out)}"
                    )
                    return out
                except Exception as e2:
                    logger.warning(
                        f"fallback recent failed backend={s.__class__.__name__} err={e2}"
                    )
        return []


# ---------- Health ----------
def ping_memory_store(store: MemoryStore) -> Dict[str, Any]:
    try:
        r = store.ping()
        return {
            "ok": bool(r.get("ok", False)),
            "backend": r.get("backend", store.__class__.__name__),
        }
    except Exception as e:
        logger.error(f"ping failed backend={store.__class__.__name__} err={e}")
        return {"ok": False, "backend": store.__class__.__name__, "error": str(e)}


def verify_memory_writes(
    primary: MemoryStore, session_id: str, trials: int = 2
) -> Tuple[bool, List[str]]:
    ids: List[str] = []
    attempts = _assert_positive(trials, "trials")
    for i in range(attempts):
        try:
            ids.append(primary.save(session_id, "system", f"__verify__{i}", {"ephemeral": True}))
        except Exception as exc:
            logger.warning(
                f"verify_memory_writes save failed backend={primary.__class__.__name__} err={exc}"
            )
            break
        time.sleep(0.001)
    try:
        got = primary.recent(session_id, limit=attempts)
    except Exception as exc:
        logger.warning(f"verify_memory_writes recent failed backend={primary.__class__.__name__} err={exc}")
        got = []
    ok = len(got) >= attempts
    logger.debug(f"verify_memory_writes ok={ok} wrote={len(ids)} read={len(got)}")
    return (ok, ids)


def _cpu_health() -> Dict[str, Any]:
    info: Dict[str, Any] = {"count": os.cpu_count() or 0}
    try:
        import psutil  # type: ignore

        info["percent"] = psutil.cpu_percent(interval=0.0)
    except Exception:
        info["percent"] = None
        logger.debug("psutil not available for cpu_percent")
    try:
        la1, la5, la15 = os.getloadavg()
        info.update({"load_1": la1, "load_5": la5, "load_15": la15})
    except Exception:
        info.update({"load_1": None, "load_5": None, "load_15": None})
    return info


def _mem_health() -> Dict[str, Any]:
    try:
        import psutil  # type: ignore

        vm = psutil.virtual_memory()
        return {
            "total": vm.total,
            "available": vm.available,
            "used": vm.used,
            "percent": vm.percent,
        }
    except Exception:
        logger.debug("psutil not available for virtual_memory")
        return {"total": None, "available": None, "used": None, "percent": None}


def _disk_health() -> Dict[str, Any]:
    try:
        total, used, free = shutil.disk_usage(os.getcwd())
        percent = round(used / total * 100, 2) if total else None
        return {"total": total, "used": used, "free": free, "percent": percent}
    except Exception as e:
        logger.debug(f"disk usage unavailable err={e}")
        return {"total": None, "used": None, "free": None, "percent": None}


def node_health() -> Dict[str, Any]:
    """Host/node snapshot used by /status and diagnostics."""
    return {
        "pid": os.getpid(),
        "host": socket.gethostname(),
        "time": int(time.time()),
        "cpu": _cpu_health(),
        "memory": _mem_health(),
        "disk": _disk_health(),
    }


def health_suite(memory: MultiMemoryStore) -> Dict[str, Any]:
    """Aggregate per-store pings + write verification + node snapshot."""
    pings = [ping_memory_store(s) for s in memory.stores]
    ok, ids = verify_memory_writes(memory.primary, "__health__", trials=2)
    report = {
        "primary": memory.primary.__class__.__name__,
        "providers": [s.__class__.__name__ for s in memory.stores],
        "pings": pings,
        "writeVerify": {"ok": ok, "ids": ids[:3]},
        "node": node_health(),
    }
    logger.debug(f"health_suite ok={ok} providers={report['providers']}")
    return report


# ---------- Self-test ----------
if __name__ == "__main__":
    m = MultiMemoryStore([InMemoryStore(), InMemoryStore()])
    m.save("sess1", "user", "hello", {"x": 1})
    m.save("sess1", "assistant", "world", {"ephemeral": True})
    recent = m.recent("sess1", 2)
    assert recent and recent[-1]["text"] in {"hello", "world"}
    ok_all, ids = verify_memory_writes(m.primary, "__selftest__", trials=3)
    assert ok_all and len(ids) == 3
    print(json.dumps({"selftest": "ok", "node": node_health()}, indent=2))
