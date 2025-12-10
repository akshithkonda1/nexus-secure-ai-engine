from __future__ import annotations

import asyncio
import uuid

from .engine_validator import validate_engine
from .fuzzer import run_fuzzer
from .k6_runner import run_load_test
from .pipeline_checker import validate_pipeline
from .replay_engine import replay_snapshot
from .sim_reporter import generate_report
from .sim_runner import run_sim_batch
from .snapshot_saver import save_snapshot
from .warroom_logger import WarRoomLogger
from .master_store import MasterStore


class MasterRunner:
    def __init__(self):
        self.store = MasterStore()
        self.logger = WarRoomLogger()

    async def run_all(self) -> str:
        run_id = str(uuid.uuid4())
        self.store.create_run(run_id)
        self.logger.log(run_id, "RUN STARTED", severity="info")

        # Engine validation gate
        self.store.update_status(run_id, "validating", steps={"engine_check": "running"}, progress=5)
        engine_check = validate_engine()
        if not engine_check.get("ok", False):
            self.logger.log(run_id, f"ENGINE VALIDATION FAILED: {engine_check}", severity="critical")
            self.store.update_status(run_id, "failed", steps={"engine_check": "failed"}, progress=5)
            return run_id
        self.store.update_status(run_id, "running", steps={"engine_check": "ok"}, progress=10)

        # SIM batch
        sim_result = await asyncio.to_thread(run_sim_batch)
        self.store.attach_metrics(run_id, {"avg_engine_latency": sim_result.get("avg_latency"), "determinism": sim_result.get("determinism")})
        self.store.update_status(run_id, "running", steps={"sim_batch": "completed"}, progress=30)

        # Pipeline integrity
        pipeline_result = validate_pipeline()
        step_status = "completed" if pipeline_result.get("stable") else "failed"
        self.store.update_status(run_id, "running", steps={"engine_check": "ok", "sim_batch": "completed", "pipeline": step_status}, progress=45)
        if not pipeline_result.get("stable"):
            self.logger.log(run_id, "PIPELINE INSTABILITY DETECTED", severity="warning")

        # Fuzzer
        fuzzer_result = run_fuzzer(run_id)
        self.store.update_status(run_id, "running", steps={"fuzzer": "completed"}, progress=60)

        # Replay determinism
        replay_result = replay_snapshot(run_id)
        replay_state = "completed" if replay_result.get("deterministic") else "failed"
        self.store.update_status(run_id, "running", steps={"replay": replay_state}, progress=70)

        # Load test
        load_result = run_load_test(run_id)
        self.store.attach_metrics(run_id, {"p95_latency": load_result.get("p95"), "p99_latency": load_result.get("p99")})
        self.store.update_status(run_id, "running", steps={"load_test": "completed"}, progress=85)

        # Snapshot + report
        snapshot_path, bundle_path = save_snapshot(run_id, {
            "run_id": run_id,
            "sim": sim_result,
            "pipeline": pipeline_result,
            "replay": replay_result,
            "load": load_result,
            "fuzzer": fuzzer_result,
        })
        report_path = generate_report(run_id, sim_result, load_result)
        self.store.attach_artifacts(run_id, snapshot=snapshot_path, bundle=bundle_path, report=report_path)
        self.store.save_result(run_id, {
            "sim": sim_result,
            "pipeline": pipeline_result,
            "fuzzer": fuzzer_result,
            "replay": replay_result,
            "load": load_result,
        })
        self.store.update_status(run_id, "completed", progress=100)
        self.logger.log(run_id, "RUN COMPLETE", severity="info")
        return run_id
