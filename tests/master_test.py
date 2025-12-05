from __future__ import annotations

import asyncio
import json
import sys
import time
import traceback
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from enterprise.encryption.byok_manager import BYOKManager
from enterprise.encryption.tenant_isolation import TenantIsolationPolicy
from enterprise.regulated.govcloud_mode import GovCloudEnforcer
from enterprise.regulated.hipaa_data_guard import HIPAADataGuard
from enterprise.regulated.pii_redaction_engine import PIIRedactionEngine
from enterprise.trust.hallucination_guard import HallucinationGuard
from enterprise.trust.model_drift_detector import ModelDriftDetector
from enterprise.trust.response_lineage import ResponseLineage
from toron import (
    CloudProviderAdapter,
    ConnectorRegistry,
    EngineConfig,
    PIIPipeline,
    Retriever,
    TokenBucket,
    ToronEngine,
)
from src.backend.connectors.connectors_unified import ConnectorsUnified
from src.backend.core.toron.engine_v2.workspace.workspace_bridge import WorkspaceBridge

RESULTS: list[dict] = []
FAILURES: list[dict] = []


class _FakeResponse:
    def __init__(self, payload, status_code: int = 200):
        self.payload = payload
        self.status_code = status_code
        self.text = payload if isinstance(payload, str) else "payload"

    def json(self):
        if isinstance(self.payload, dict):
            return self.payload
        raise ValueError("Payload is not JSON serialisable")


class FakeSession:
    def __init__(self, payload, status_code: int = 200):
        self._payload = payload
        self._status_code = status_code

    def get(self, url: str, timeout: int = 5):
        return _FakeResponse(self._payload, self._status_code)


def run_test(name: str, function) -> None:
    started = time.time()
    try:
        function()
        RESULTS.append({
            "name": name,
            "status": "passed",
            "started_at": datetime.utcfromtimestamp(started).isoformat() + "Z",
            "duration": round(time.time() - started, 6),
        })
    except Exception as exc:  # pragma: no cover - defensive safety net
        failure = {
            "name": name,
            "status": "failed",
            "started_at": datetime.utcfromtimestamp(started).isoformat() + "Z",
            "duration": round(time.time() - started, 6),
            "error": str(exc),
            "traceback": traceback.format_exc(),
        }
        RESULTS.append(failure)
        FAILURES.append(failure)


def smoke_tests() -> None:
    session = FakeSession({"message": "ok"})
    engine = ToronEngine(
        config=EngineConfig(host="127.0.0.1", port=8080),
        connectors=ConnectorRegistry.default(),
        adapter=CloudProviderAdapter(),
        pii_pipeline=PIIPipeline(),
        retriever=Retriever(session=session),
        rate_limiter=TokenBucket(capacity=10, fill_rate=5),
        metadata={"env": "test"},
    )
    manifest = engine.bootstrap()
    assert manifest["host"] == "127.0.0.1"
    assert manifest["metadata"]["env"] == "test"

    connectors = ConnectorsUnified()
    states = connectors.get_all_states()
    assert set(states.values()) == {"disconnected"}
    synced = connectors.sync_all()
    assert all(state == "synced" for state in synced.values())


def trust_layer_tests() -> None:
    guard = HallucinationGuard()
    risk, flags = guard.validate(["fact", "fact", "fiction"])
    assert risk >= 0
    assert isinstance(flags, list)

    drift = ModelDriftDetector(window_size=2, alert_threshold=0.2)
    for ref in ([1.0, 0.0], [1.0, 0.0]):
        drift.add_reference(ref)
    for obs in ([0.0, 1.0], [0.0, 1.0]):
        alerted = drift.observe(obs)
    assert drift.anomaly_window() >= 0
    assert alerted is True


def lineage_tests() -> None:
    lineage = ResponseLineage()
    block = lineage.add_block(
        prompt="hello world",
        model_set=["gpt", "claude"],
        tfidf_metadata={"keywords": ["hello", "world"]},
        behavioral_signature="calm",
        debate_rounds=2,
    )
    assert block.prev_hash == "genesis"
    lineage.add_block(
        prompt="follow up",
        model_set=["gpt"],
        tfidf_metadata={"keywords": ["follow"]},
        behavioral_signature="direct",
        debate_rounds=1,
    )
    assert lineage.chain_valid() is True


def byok_encryption_tests() -> None:
    manager = BYOKManager()
    tenant = "tenant-123"
    manager.register_tenant_key(tenant, "key-1", b"0" * 32, "aws")
    package = manager.encrypt_for_tenant(tenant, b"secret", aad=b"scope")
    plaintext = manager.decrypt_for_tenant(tenant, package, aad=b"scope")
    assert plaintext == b"secret"

    rotated = manager.rotate_key(tenant, "key-2", b"1" * 32, "gcp")
    assert rotated.active is True
    assert manager.get_active_key(tenant).key_id == "key-2"


def compliance_tests() -> None:
    pii_engine = PIIRedactionEngine()
    hipaa_guard = HIPAADataGuard.with_random_key(pii_engine)
    request = {"actor": "nurse", "content": "Patient Alice Smith has diabetes"}
    guarded = hipaa_guard.guard_request(request)
    response = hipaa_guard.guard_response({"content": guarded["content"], "actor": "nurse"}, guarded["nonce"])
    assert "[REDACTED]" in response["content"] or response["pii_findings"]

    gov = GovCloudEnforcer(allowed_regions=["us-gov-west-1"], allowed_models=["bedrock.gov"], zero_retention=True)
    enforced_request = gov.enforce_request({"region": "us-gov-west-1", "model": "bedrock.gov-large"})
    enforced_response = gov.enforce_response({"content": "ok"})
    assert enforced_request["external_api_allowed"] is False
    assert enforced_response["fedramp"]

    redacted = pii_engine.redact("Contact Bob at bob@example.com")
    assert redacted.redacted_text != "Contact Bob at bob@example.com"


def workspace_backend_logic_tests() -> None:
    connectors = ConnectorsUnified()
    connectors.update_state("github", "connected")
    assert connectors.get_all_states()["github"] == "connected"

    tasks = []
    tasks.append({"id": 1, "title": "Draft"})
    tasks.append({"id": 2, "title": "Review"})
    tasks[0]["title"] = "Draft proposal"
    tasks = [task for task in tasks if task["id"] != 2]
    assert len(tasks) == 1 and tasks[0]["title"] == "Draft proposal"

    bridge = WorkspaceBridge()
    context = {"session": "abc"}
    workspace_state = {"tasks": tasks, "calendar": ["10am sync"]}
    enriched = asyncio.run(bridge.inject_context(context, workspace_state))
    assert "workspace" in enriched and "tasks" in enriched["workspace"]


def integration_tests() -> None:
    session = FakeSession({"message": "ok"})
    engine = ToronEngine(
        config=EngineConfig(host="0.0.0.0", port=9090),
        connectors=ConnectorRegistry.default(),
        adapter=CloudProviderAdapter(),
        pii_pipeline=PIIPipeline(),
        retriever=Retriever(session=session),
        rate_limiter=TokenBucket(capacity=5, fill_rate=2),
    )
    manifest = engine.bootstrap()

    guard = HallucinationGuard()
    _, flags = guard.validate(["safe response", "safe response"])

    lineage = ResponseLineage()
    lineage.add_block(
        prompt="integration",
        model_set=list(manifest["endpoints"].keys()),
        tfidf_metadata={"connectors": len(manifest["connectors"]), "flags": flags},
        behavioral_signature="stable",
        debate_rounds=1,
    )
    assert lineage.chain_valid() is True


def failure_handling_tests() -> None:
    manager = BYOKManager()
    tenant = "a"
    manager.register_tenant_key(tenant, "k1", b"2" * 32, "azure")
    package = manager.encrypt_for_tenant(tenant, b"payload")
    try:
        manager.decrypt_for_tenant("different", package)
    except RuntimeError:
        pass
    else:  # pragma: no cover - defensive fallback
        raise AssertionError("Tenant isolation failure was not raised")

    policy = TenantIsolationPolicy(tenant_id="t1", boundaries={"storage": "strict"})
    enforced = policy.enforce("storage", "resource")
    assert enforced.startswith("t1:")

    drift = ModelDriftDetector(window_size=4)
    alerted = drift.observe([1.0, 1.0])
    assert alerted is False


def main() -> None:
    started = time.time()
    run_test("smoke_tests", smoke_tests)
    run_test("trust_layer_tests", trust_layer_tests)
    run_test("lineage_tests", lineage_tests)
    run_test("byok_encryption_tests", byok_encryption_tests)
    run_test("compliance_tests", compliance_tests)
    run_test("workspace_backend_logic_tests", workspace_backend_logic_tests)
    run_test("integration_tests", integration_tests)
    run_test("failure_handling_tests", failure_handling_tests)

    summary = {
        "started_at": datetime.utcfromtimestamp(started).isoformat() + "Z",
        "finished_at": datetime.utcnow().isoformat() + "Z",
        "duration": round(time.time() - started, 6),
        "passed": len([r for r in RESULTS if r.get("status") == "passed"]),
        "failed": len(FAILURES),
        "results": RESULTS,
        "failures": FAILURES,
    }
    print(json.dumps(summary, indent=2, default=str))


if __name__ == "__main__":
    main()
