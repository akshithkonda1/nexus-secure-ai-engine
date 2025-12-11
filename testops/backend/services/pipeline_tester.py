"""Offline pipeline tester using the Toron engine and SIM prompts."""
from __future__ import annotations

import json
import statistics
import time
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

from testops.backend.snapshots.snapshot_store import SnapshotStore

from .engine_binding import run_single

LOG_DIR = Path(__file__).resolve().parents[1] / "logs" / "master"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_PATH = LOG_DIR / "pipeline_tester.log"
SIM_DATASET = Path(__file__).resolve().parents[1] / "tests_master" / "sim" / "sim_dataset.json"
SNAPSHOT_DIR = Path(__file__).resolve().parents[1] / "snapshots" / "pipeline"


def _append_log(message: str) -> None:
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {message}\n")


def _load_sim_prompts() -> List[str]:
    prompts: List[str] = []
    if SIM_DATASET.exists():
        dataset = json.loads(SIM_DATASET.read_text(encoding="utf-8"))
        prompts = [s.get("prompt", "") for s in dataset.get("sessions", []) if s.get("prompt")]
    seed_prompts = prompts or [
        "Toron determinism check",
        "Safety routing validation",
        "Opus escalation sanity",
    ]
    while len(prompts) < 20:
        base = seed_prompts[len(prompts) % len(seed_prompts)]
        prompts.append(f"{base} :: {len(prompts) + 1}")
    return prompts[:20]


def _avg(values: Sequence[float]) -> float:
    return round(float(statistics.mean(values)), 2) if values else 0.0


def _p95(values: Sequence[float]) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = int(0.95 * (len(ordered) - 1))
    return round(float(ordered[index]), 2)


def _tier1_latency(snapshot: Dict[str, object]) -> float:
    t1_raw: List[Dict[str, object]] = snapshot.get("T1_RAW", [])  # type: ignore[assignment]
    latencies = [float(entry.get("latency_ms", 0)) for entry in t1_raw if isinstance(entry, dict)]
    return _avg(latencies)


def _judicial_latency(snapshot: Dict[str, object]) -> float:
    judicial = snapshot.get("JUDICIAL_RESULT", {})
    opus_latency = 0.0
    if isinstance(judicial, dict):
        opus_latency = float(judicial.get("opus_result", {}).get("latency_ms", 0))
    return opus_latency


def _contradiction_count(snapshot: Dict[str, object]) -> int:
    summary = snapshot.get("T1_SUMMARY", {})
    if not isinstance(summary, dict):
        return 0
    contradiction_map = summary.get("contradiction_map", {})
    return len(contradiction_map) if isinstance(contradiction_map, dict) else 0


def _meta_flags(output: Dict[str, object]) -> Tuple[str, ...]:
    flags = output.get("meta_surveillance_flags", [])
    return tuple(sorted(flag for flag in flags if isinstance(flag, str)))


class PipelineTester:
    """Run deterministic Toron pipelines against SIM prompts."""

    def __init__(self) -> None:
        self.snapshot_store = SnapshotStore(SNAPSHOT_DIR)

    def run(self, run_id: str) -> Dict[str, object]:
        prompts = _load_sim_prompts()
        runs: List[Dict[str, object]] = []
        wall_latencies: List[float] = []
        tier1_latencies: List[float] = []
        judicial_latencies: List[float] = []
        contradictions = 0
        opus_escalations: List[Dict[str, object]] = []
        aggregated_meta_flags: set[str] = set()

        for prompt in prompts:
            start = time.perf_counter()
            output = run_single(prompt)
            wall_ms = int((time.perf_counter() - start) * 1000)
            snapshot = output.get("state_snapshot", {})
            tier1_latency = _tier1_latency(snapshot)
            judicial_latency = _judicial_latency(snapshot)
            contradiction_count = _contradiction_count(snapshot)
            meta_flags = _meta_flags(output)

            wall_latencies.append(float(wall_ms))
            if tier1_latency:
                tier1_latencies.append(tier1_latency)
            if judicial_latency:
                judicial_latencies.append(judicial_latency)
            contradictions += contradiction_count
            aggregated_meta_flags.update(meta_flags)
            if output.get("opus_used"):
                opus_escalations.append({
                    "prompt": prompt,
                    "latency_ms": judicial_latency,
                })

            runs.append(
                {
                    "prompt": prompt,
                    "latency_ms": wall_ms,
                    "tier1_latency_ms": tier1_latency,
                    "judicial_latency_ms": judicial_latency,
                    "contradictions": contradiction_count,
                    "meta_flags": list(meta_flags),
                    "opus_used": bool(output.get("opus_used")),
                    "final_answer": output.get("final_answer", ""),
                }
            )

        determinism_probe = self._determinism_probe(prompts[0], runs[0]["final_answer"] if runs else "")

        latency_per_tier = {
            "overall_avg_ms": _avg(wall_latencies),
            "overall_p95_ms": _p95(wall_latencies),
            "tier1_avg_ms": _avg(tier1_latencies),
            "judicial_avg_ms": _avg(judicial_latencies),
        }

        payload = {
            "status": "PASS" if contradictions == 0 else "WARN",
            "tested_prompts": prompts,
            "latency_per_tier": latency_per_tier,
            "contradictions": contradictions,
            "opus_escalations": opus_escalations,
            "meta_flags": sorted(aggregated_meta_flags),
            "determinism_preview": determinism_probe,
            "runs": runs,
        }

        snapshot_path = self.snapshot_store.save(run_id, "pipeline_tester", payload)
        payload["snapshot_path"] = str(snapshot_path)
        _append_log(f"Pipeline tester captured {len(prompts)} prompts; snapshot={snapshot_path}")
        return payload

    def _determinism_probe(self, prompt: str, baseline_answer: str) -> Dict[str, object]:
        repeat_output = run_single(prompt)
        repeat_answer = repeat_output.get("final_answer", "")
        stable = repeat_answer == baseline_answer
        return {
            "prompt": prompt,
            "baseline_answer": baseline_answer,
            "repeat_answer": repeat_answer,
            "stable": stable,
        }


__all__ = ["PipelineTester"]
