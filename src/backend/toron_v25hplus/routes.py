from __future__ import annotations

from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException

from .schemas import (
    EngineDeterminismRequest,
    EngineMalRequest,
    EngineSnapshotValidateRequest,
    EngineTierRequest,
    LoadCustomRequest,
    LoadRunRequest,
    MetricsEnvelope,
    SimBatchRequest,
    SimReplayRequest,
    SimRunRequest,
    SimStressRequest,
    SnapshotDiffRequest,
    TelemetryQuarantineRequest,
    TelemetryScrubRequest,
    WarRoomEvent,
)
from .store import TestStore, store

router = APIRouter()


def get_store() -> TestStore:
    return store


@router.post("/tests/sim/run")
def run_sim(payload: SimRunRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    result = db.record_sim_run("single", [payload.scenario])
    return {"status": "completed", **result, "workload": payload.workload}


@router.post("/tests/sim/batch")
def run_sim_batch(payload: SimBatchRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    result = db.record_sim_run("batch", payload.scenarios)
    return {"status": "completed", **result, "count": len(payload.scenarios)}


@router.post("/tests/sim/full")
def run_sim_full(db: TestStore = Depends(get_store)) -> Dict[str, object]:
    scenarios = [f"full-suite-{idx}" for idx in range(1, 6)]
    result = db.record_sim_run("full", scenarios)
    return {"status": "completed", **result, "total": len(scenarios)}


@router.post("/tests/sim/stress")
def run_sim_stress(payload: SimStressRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    scenarios = ["latency-ceiling", "throughput-flood", "pii-redaction"]
    result = db.record_sim_run("stress", scenarios, duration=payload.duration_seconds / 10)
    db.record_war_room("critical", "Stress run executed", f"Concurrency {payload.concurrency}")
    return {
        "status": "completed",
        **result,
        "concurrency": payload.concurrency,
        "duration_seconds": payload.duration_seconds,
    }


@router.post("/tests/sim/replay")
def run_sim_replay(payload: SimReplayRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    scenarios = [payload.seed_run_id or "replay-baseline"]
    result = db.record_sim_run("replay", scenarios)
    return {"status": "completed", **result, "seed": payload.seed_run_id, "snapshot_id": payload.snapshot_id or result["snapshot_id"]}


@router.post("/tests/load/run")
def run_load(payload: LoadRunRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    run_id = db.record_load_run(payload.profile, payload.duration_seconds, payload.virtual_users)
    return {
        "status": "completed",
        "run_id": run_id,
        "profile": payload.profile,
        "duration_seconds": payload.duration_seconds,
        "virtual_users": payload.virtual_users,
    }


@router.post("/tests/load/custom")
def run_custom_load(payload: LoadCustomRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    run_id = db.record_load_run(payload.profile_name, payload.duration_seconds, payload.rps_target)
    db.record_war_room("warning", "Custom load profile executed", payload.profile_name)
    return {
        "status": "completed",
        "run_id": run_id,
        "profile": payload.profile_name,
        "target_rps": payload.rps_target,
    }


@router.post("/tests/telemetry/scrub")
def scrub_telemetry(payload: TelemetryScrubRequest) -> Dict[str, object]:
    return {"status": "scrubbed", "note": payload.note}


@router.post("/tests/telemetry/quarantine")
def quarantine_telemetry(payload: TelemetryQuarantineRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    db.record_war_room("critical", payload.reason, ", ".join(payload.signals) or "isolate signals")
    return {"status": "quarantined", "reason": payload.reason, "signals": payload.signals}


@router.post("/tests/engine/tier")
def set_engine_tier(payload: EngineTierRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    result = db.record_sim_run("engine-tier", [payload.tier])
    return {"status": "completed", **result, "tier": payload.tier}


@router.post("/tests/engine/mal")
def analyze_mal(payload: EngineMalRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    result = db.record_sim_run("mal-analysis", ["mal"], duration=0.5)
    db.record_war_room("warning", "MAL pattern detected", str(payload.payload))
    return {"status": "completed", **result, "inspected": list(payload.payload.keys())}


@router.post("/tests/engine/determinism")
def check_determinism(payload: EngineDeterminismRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    runs = [f"det-run-{idx}" for idx in range(payload.runs)]
    result = db.record_sim_run("determinism", runs, duration=payload.runs * 0.2)
    return {"status": "completed", **result, "runs": payload.runs}


@router.post("/tests/engine/snapshot-validate")
def validate_snapshot(payload: EngineSnapshotValidateRequest, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    snapshot = db.snapshot(payload.snapshot_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return {"status": "validated", "snapshot_id": payload.snapshot_id, "summary": snapshot.get("summary")}


@router.get("/tests/history")
def get_history(db: TestStore = Depends(get_store)) -> List[Dict[str, object]]:
    return db.history()


@router.get("/tests/snapshots")
def list_snapshots(db: TestStore = Depends(get_store)) -> List[Dict[str, object]]:
    return db.snapshots()


@router.get("/tests/snapshot/{snapshot_id}")
def get_snapshot(snapshot_id: str, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    snapshot = db.snapshot(snapshot_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return snapshot


@router.post("/tests/snapshot/diff")
def diff_snapshots(payload: SnapshotDiffRequest, db: TestStore = Depends(get_store)) -> Dict[str, Dict[str, object]]:
    return db.diff_snapshots(payload.source_id, payload.target_id)


@router.get("/metrics/live")
def live_metrics(db: TestStore = Depends(get_store)) -> Dict[str, object]:
    metrics = db.live_metrics()
    return metrics


@router.get("/metrics/stability")
def stability(db: TestStore = Depends(get_store)) -> Dict[str, object]:
    return db.stability_metrics()


@router.get("/metrics/load/{run_id}")
def load_metrics(run_id: str, db: TestStore = Depends(get_store)) -> Dict[str, object]:
    return db.load_metrics(run_id)


@router.get("/metrics/war-room")
def war_room(db: TestStore = Depends(get_store)) -> List[WarRoomEvent]:
    events = db.war_room()
    return [WarRoomEvent(**event) for event in events]


@router.get("/metrics/live/envelope")
def live_metrics_envelope(db: TestStore = Depends(get_store)) -> List[MetricsEnvelope]:
    metrics = db.live_metrics()
    return [
        MetricsEnvelope(label="SIM runs", value=metrics["sim_runs"], unit="runs"),
        MetricsEnvelope(label="Load runs", value=metrics["load_runs"], unit="runs"),
        MetricsEnvelope(label="Stability", value=metrics["stability"], unit="percent"),
        MetricsEnvelope(label="Open events", value=metrics["open_events"], unit="events"),
    ]
