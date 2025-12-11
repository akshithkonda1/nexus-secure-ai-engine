import asyncio
import json
from datetime import datetime
from typing import Dict
from testops_backend.core.config import SIM_MAX_USERS
from testops_backend.core.logger import get_logger
from testops_backend.core.models import RunState
from .master_models import LogEvent, MasterResult, PhaseResult, TestPhase
from .master_store import broker, persist_result, record_log, record_run_start, record_run_state
from .master_reporter import MasterReporter
from .k6_runner import K6Runner
from .sim_runner import SimRunner
from .replay_engine import ReplayEngine
from .pipeline_checker import PipelineChecker

logger = get_logger("master_runner", warroom=True)


class MasterRunner:
    def __init__(self) -> None:
        self.reporter = MasterReporter()
        self.k6 = K6Runner()
        self.sim = SimRunner()
        self.replay = ReplayEngine()
        self.pipeline = PipelineChecker()

    async def _log(self, run_id: str, level: str, message: str, step: TestPhase | None = None) -> None:
        timestamp = datetime.utcnow().isoformat()
        event = LogEvent(timestamp=timestamp, level=level, message=message, step=step.value if step else None)
        record_log(run_id, event)
        await broker.push(run_id, event)
        log_fn = getattr(logger, level.lower(), logger.info)
        log_fn(f"{run_id} | {message}")

    async def run_all(self, run_id: str) -> MasterResult:
        record_run_start(run_id)
        phases: list[PhaseResult] = []
        artifacts: Dict[str, str] = {}
        started_at = datetime.utcnow()
        deterministic = True

        try:
            await self._log(run_id, "info", "Validating Toron engine connectivity", TestPhase.engine_validation)
            engine_ok = self.pipeline.validate_engine()
            phases.append(PhaseResult(TestPhase.engine_validation, engine_ok, notes=["Ping executed"]))
            if not engine_ok:
                raise RuntimeError("Engine validation failed")

            await self._log(run_id, "info", "Running SIM batch for tier reasoning", TestPhase.sim_batch)
            sim_result = await self.sim.run_batch(run_id, SIM_MAX_USERS)
            phases.append(PhaseResult(TestPhase.sim_batch, True, sim_result.metrics, sim_result.notes))
            artifacts.update(sim_result.artifacts)

            await self._log(run_id, "info", "Performing pipeline consistency checks", TestPhase.pipeline)
            pipeline_summary = self.pipeline.check_pipeline()
            phases.append(PhaseResult(TestPhase.pipeline, pipeline_summary["success"], pipeline_summary["metrics"], pipeline_summary["notes"]))

            await self._log(run_id, "info", "Executing load tests via k6", TestPhase.load_test)
            load_metrics = await self.k6.run_load_test(run_id)
            phases.append(PhaseResult(TestPhase.load_test, True, load_metrics, ["k6 synthetic run completed"]))

            await self._log(run_id, "info", "Running determinism replay", TestPhase.replay)
            replay_summary = self.replay.run_replay(run_id)
            deterministic = deterministic and replay_summary["deterministic"]
            phases.append(PhaseResult(TestPhase.replay, replay_summary["deterministic"], replay_summary["metrics"], replay_summary["notes"]))
            artifacts.update(replay_summary["artifacts"])

            await self._log(run_id, "info", "Generating master reports", TestPhase.reporting)
            report_paths, metrics = self.reporter.build_reports(run_id, phases, deterministic)
            artifacts.update({"report_html": report_paths["html"], "report_json": report_paths["json"]})

            result = MasterResult(
                run_id=run_id,
                started_at=started_at,
                completed_at=datetime.utcnow(),
                phases=phases,
                deterministic=deterministic,
                artifacts=artifacts,
            )
            persist_result(
                run_id,
                {
                    "metrics": metrics,
                    "artifacts": artifacts,
                    "deterministic": deterministic,
                },
            )
            record_run_state(run_id, RunState.completed, "Run completed")
            await broker.finalize(run_id)
            return result
        except Exception as exc:
            await self._log(run_id, "error", f"Run failed: {exc}")
            record_run_state(run_id, RunState.failed, str(exc))
            await broker.finalize(run_id)
            raise


runner = MasterRunner()
