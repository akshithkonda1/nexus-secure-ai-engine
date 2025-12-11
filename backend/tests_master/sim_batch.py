import json, time, random, uuid
from pathlib import Path
from .sim_runner import run_single_simulation
from .master_models import RunResult
from .warroom_logger import log_error
from . import sim_assertions
from .engine_loader import load_engine_instance
import yaml


class SimBatchRunner:
    def __init__(self, config_path: str):
        self.config_path = Path(config_path)
        with open(self.config_path, "r") as f:
            self.config = yaml.safe_load(f)

        self.base_dir = Path(__file__).resolve().parent
        self.snapshot_dir = self.base_dir / self.config["SIM_SETTINGS"].get("SNAPSHOT_DIR", "snapshots")
        self.report_dir = self.base_dir / self.config["SIM_SETTINGS"].get("REPORT_DIR", "reports/master")

        self.snapshot_dir.mkdir(parents=True, exist_ok=True)
        self.report_dir.mkdir(parents=True, exist_ok=True)

        seed = self.config["SIM_SETTINGS"].get("BASE_SEED", 0)
        random.seed(seed)

    def run_batch(self, run_id: str):
        engine = load_engine_instance()
        num_runs = min(self.config["SIM_SETTINGS"].get("MAX_RUNS", 0), 10000)
        num_runs = max(1500, num_runs)
        seed = self.config["SIM_SETTINGS"].get("BASE_SEED", 0)
        random.seed(seed)

        results = []
        latencies = []
        confidences = []
        flags = []
        pipeline_paths = {}
        t1_counts = []
        t2_audits = []
        opus_escalations = 0
        contradiction_flags = 0
        snapshot_shapes = []

        for i in range(num_runs):
            try:
                snapshot = run_single_simulation(engine, seed + i)
                sim_assertions.assert_snapshot_structure(snapshot)
                sim_assertions.assert_confidence_valid(snapshot["confidence"])
                sim_assertions.assert_t1_valid(snapshot["t1_raw"])
                sim_assertions.assert_synthesis_valid(snapshot["synthesis"])
                sim_assertions.assert_latency_valid(snapshot["latency_ms"])

                results.append(snapshot)
                latencies.append(snapshot["latency_ms"])
                confidences.append(snapshot["confidence"])
                flags.extend(snapshot.get("meta_flags", []))

                pipeline_path = snapshot.get("pipeline_path", "sim-default")
                pipeline_paths[pipeline_path] = pipeline_paths.get(pipeline_path, 0) + 1
                t1_counts.append(len(snapshot.get("t1_raw", [])))
                t2_audits.append(snapshot.get("t2", {}).get("audit", ""))
                snapshot_shapes.append(list(snapshot.keys()))

                if any("opus" in f for f in snapshot.get("meta_flags", [])):
                    opus_escalations += 1
                if any("contradiction" in f for f in snapshot.get("meta_flags", [])):
                    contradiction_flags += 1

                snapshot_file = self.snapshot_dir / f"{run_id}_sim_{i}.json"
                with open(snapshot_file, "w") as f:
                    json.dump({"run_index": i, **snapshot}, f, indent=2)
            except Exception as e:
                log_error(run_id, f"SIM FAILURE {i}: {str(e)}")

        if not latencies:
            return None

        latencies_sorted = sorted(latencies)
        p95_index = int(0.95 * len(latencies_sorted))
        p95_latency = latencies_sorted[p95_index]

        confidence_distribution = {
            "min": min(confidences),
            "max": max(confidences),
            "avg": sum(confidences) / len(confidences),
        }

        summary = {
            "run_id": run_id,
            "avg_latency_ms": sum(latencies) / len(latencies),
            "p95_latency_ms": p95_latency,
            "avg_confidence": confidence_distribution["avg"],
            "flag_counts": {f: flags.count(f) for f in set(flags)},
            "total_runs": len(results),
            "confidence_distribution": confidence_distribution,
            "pipeline_frequency": pipeline_paths,
            "t1_behaviors": {"avg_count": sum(t1_counts) / len(t1_counts)},
            "t2_audits": {"unique": list(set(t2_audits))},
            "opus_escalation_rate": opus_escalations / len(results) if results else 0,
            "contradiction_flags": contradiction_flags,
            "determinism_snapshot_shape": snapshot_shapes[0] if snapshot_shapes else [],
        }

        report_file = self.report_dir / f"{run_id}_sim_summary.json"
        with open(report_file, "w") as f:
            json.dump(summary, f, indent=2)

        return summary
