import asyncio
import uuid
from typing import Any, Dict

from backend.tests_master.engine_validator import validate_engine
from backend.tests_master.fuzzer import ToronFuzzer
from backend.tests_master.k6_runner import run_load_test
from backend.tests_master.master_store import MasterStore
from backend.tests_master.pipeline_checker import run_pipeline_checks
from backend.tests_master.replay_engine import replay_snapshot
from backend.tests_master.sim_reporter import generate_report
from backend.tests_master.sim_runner import run_sim_batch
from backend.tests_master.snapshot_saver import save_snapshot
from backend.tests_master.warroom_logger import WarRoomLogger

store = MasterStore()
logger = WarRoomLogger(store)


class MasterRunner:
    def __init__(self):
        self.loop = asyncio.get_event_loop()

    async def run_all(self) -> str:
        run_id = str(uuid.uuid4())
        store.create_run(run_id)
        logger.log(run_id, "RUN STARTED", severity="INFO")
        self.loop.create_task(self._execute_run(run_id))
        return run_id

    async def _execute_run(self, run_id: str) -> None:
        seed = uuid.UUID(run_id).int % 1_000_000

        store.update_status(run_id, "validating", progress=0.05, phase="engine_validation")
        validation = validate_engine()
        if not validation.get("ok"):
            logger.log(run_id, f"Engine validation failed: {validation}", severity="CRITICAL")
            store.update_status(run_id, "failed", progress=1.0, phase="engine_validation")
            store.save_result(run_id, {"validation": validation})
            return
        logger.log(run_id, "Engine validation passed", severity="INFO")

        store.update_status(run_id, "running", progress=0.15, phase="sim_batch")
        sim_result = await asyncio.to_thread(run_sim_batch, run_id, seed)
        logger.log(run_id, "SIM batch completed", severity="INFO")

        store.update_status(run_id, "running", progress=0.35, phase="pipeline_checks")
        pipeline_result = await asyncio.to_thread(run_pipeline_checks, seed)
        logger.log(run_id, "Pipeline checks completed", severity="INFO")

        store.update_status(run_id, "running", progress=0.45, phase="fuzzer")
        fuzzer_result = await asyncio.to_thread(ToronFuzzer(logger).run, run_id, seed + 1)
        logger.log(run_id, "Fuzzer completed", severity="INFO")

        store.update_status(run_id, "running", progress=0.55, phase="snapshot")
        snapshot_info = await asyncio.to_thread(save_snapshot, run_id, sim_result)
        logger.log(run_id, f"Snapshot saved: {snapshot_info['snapshot_path']}", severity="INFO")

        store.update_status(run_id, "running", progress=0.65, phase="replay")
        replay_result = await asyncio.to_thread(replay_snapshot, run_id, snapshot_info["snapshot_path"])
        logger.log(run_id, "Replay completed", severity="INFO")

        store.update_status(run_id, "running", progress=0.75, phase="load_test")
        load_result = await asyncio.to_thread(run_load_test, run_id, seed + 2)
        logger.log(run_id, "Load test completed", severity="INFO")

        store.update_status(run_id, "running", progress=0.85, phase="report")
        report_path = await asyncio.to_thread(generate_report, run_id, sim_result, load_result)
        logger.log(run_id, f"Report generated at {report_path}", severity="INFO")

        aggregate: Dict[str, Any] = {
            "validation": validation,
            "sim": sim_result,
            "pipeline": pipeline_result,
            "fuzzer": fuzzer_result,
            "snapshot": snapshot_info,
            "replay": replay_result,
            "load": load_result,
            "report": {"path": str(report_path)},
        }

        store.save_result(run_id, aggregate)
        store.update_status(run_id, "completed", progress=1.0, phase="completed")
        logger.log(run_id, "RUN COMPLETE", severity="INFO")

    def summarize_status(self, run_id: str) -> Dict[str, Any]:
        status = store.get_status(run_id) or {}
        result = store.get_result(run_id) or {}
        return {"status": status, "result": result}
