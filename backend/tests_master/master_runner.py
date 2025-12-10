from __future__ import annotations

import asyncio
import json
import random
from pathlib import Path

from .k6_runner import run_load_test
from .master_models import RunStatus
from .master_reporter import build_report
from .master_store import REPORT_BASE, SNAPSHOT_DIR, TestStore
from .pipeline_checker import run_full_engine_check
from .replay_engine import replay_snapshot
from .warroom_logger import WarRoomLogger


class MasterRunner:
    def __init__(self):
        self.store = TestStore()
        self.logger = WarRoomLogger()

    async def run_full_test(self, run_id: str) -> None:
        try:
            self.store.update_progress(run_id, 0, "sim_batch")
            self.store.add_log(run_id, "Starting SIM batch...")
            sim_results = await asyncio.to_thread(self._run_sim_batch, run_id)

            self.store.update_progress(run_id, 25, "pipeline_checks")
            self.store.add_log(run_id, "Running pipeline health checks...")
            pipeline_result = await asyncio.to_thread(self._run_pipeline_checks, run_id)

            self.store.update_progress(run_id, 45, "replay")
            self.store.add_log(run_id, "Running determinism replay...")
            replay_result = await asyncio.to_thread(
                replay_snapshot, run_id, sim_results["snapshot_name"]
            )

            self.store.update_progress(run_id, 65, "load_test")
            self.store.add_log(run_id, "Running load test (k6)...")
            load_result = await asyncio.to_thread(run_load_test, run_id)

            self.store.update_progress(run_id, 80, "report")
            self.store.add_log(run_id, "Generating report...")
            summary = {
                "avg_latency_ms": sim_results["avg_latency"],
                "p95_latency_ms": load_result.p95_latency_ms,
                "avg_confidence": sim_results["avg_confidence"],
                "total_runs": sim_results["total"],
                "flag_counts": pipeline_result.pipeline_path_distribution,
                "determinism_score": replay_result.determinism_score,
            }

            report_paths = await asyncio.to_thread(self._write_report, run_id, summary)

            self.store.update_progress(run_id, 100, "finished")
            self.store.save_result(
                run_id,
                {
                    "summary": summary,
                    "report": report_paths,
                    "replay": replay_result.dict(),
                    "load": load_result.dict(),
                    "pipeline": pipeline_result.dict(),
                    "sim": sim_results,
                },
            )
            self.store.add_log(run_id, "Test suite completed successfully.")
        except Exception as exc:  # pragma: no cover - defensive logging
            message = f"Unhandled exception: {exc}"
            self.logger.log(run_id, message)
            self.store.add_log(run_id, message)
            self.store.save_result(run_id, {"error": str(exc)})

    def _run_sim_batch(self, run_id: str) -> dict:
        rng = random.Random(run_id)
        latencies = [rng.uniform(120, 280) for _ in range(10)]
        confidences = [rng.uniform(0.7, 0.98) for _ in range(10)]
        avg_latency = round(sum(latencies) / len(latencies), 3)
        avg_confidence = round(sum(confidences) / len(confidences), 4)

        snapshot_data = {
            "run_id": run_id,
            "latencies": latencies,
            "confidences": confidences,
        }
        SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
        snapshot_name = f"{run_id}_snapshot.json"
        snapshot_path = SNAPSHOT_DIR / snapshot_name
        snapshot_path.write_text(json.dumps(snapshot_data, indent=2), encoding="utf-8")

        return {
            "avg_latency": avg_latency,
            "avg_confidence": avg_confidence,
            "total": len(latencies),
            "first_snapshot": str(snapshot_path),
            "snapshot_name": snapshot_name,
        }

    def _run_pipeline_checks(self, run_id: str):
        seed = abs(hash(run_id)) % (2**32)
        return run_full_engine_check(seed)

    def _write_report(self, run_id: str, summary: dict) -> dict:
        run_summary = self._build_run_summary(run_id, summary)
        outputs = build_report(run_summary, base_dir=REPORT_BASE)
        return {"html": str(outputs["html"]), "json": str(outputs["json"])}

    def _build_run_summary(self, run_id: str, metrics: dict):
        return self._run_summary_class()(run_id=run_id, status=RunStatus.completed, metrics=metrics)

    @staticmethod
    def _run_summary_class():
        # Lazy import to avoid circular dependency in typing
        from .master_models import RunSummary

        return RunSummary
