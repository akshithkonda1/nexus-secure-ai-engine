"""Simulation runner for the Toron pipeline.

The runner executes synthetic, offline calls through a mocked Toron pipeline
using deterministic seeds. Each run produces latency maps, contradiction maps,
confidence distributions, tier failures, and a determinism baseline snapshot.
"""
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple
import yaml

from testops_backend.core.config import SIM_DIR
from .sim_assertions import evaluate_result
from .sim_reporter import write_sim_report, write_sim_html_report
from .sim_seed import SeedContext, build_seed, determinism_fingerprint
from .sim_replay import save_snapshot


@dataclass
class SimulationResult:
    run_id: str
    latency_map: Dict[str, List[float]]
    tier_failures: Dict[str, int]
    contradiction_map: List[Dict[str, str]]
    confidence_distribution: List[float]
    determinism_baseline: str
    metrics: Dict[str, float]
    notes: List[str]
    json_report_path: Path
    html_report_path: Path


def _load_config() -> dict:
    config_path = SIM_DIR / "sim_config.yaml"
    return yaml.safe_load(config_path.read_text(encoding="utf-8"))


def _load_dataset() -> dict:
    dataset_path = SIM_DIR / "sim_dataset.json"
    return json.loads(dataset_path.read_text(encoding="utf-8"))


def _simulate_toron_call(prompt: str, tier: str, seed_ctx: SeedContext, scale: int) -> Tuple[float, float, bool]:
    """Return latency (ms), confidence score, and contradiction flag."""

    base_latency = 50 + (seed_ctx.seed % 25)
    jitter = seed_ctx.rng.uniform(0.5, 8.0)
    tier_modifier = {
        "alpha": 0.9,
        "beta": 1.0,
        "gamma": 1.2,
    }.get(tier, 1.0)
    latency = (base_latency + jitter) * tier_modifier * (1 + (scale / 50000))
    confidence = round(0.55 + (seed_ctx.rng.random() * 0.4), 3)
    contradiction = "!" in prompt or confidence < 0.6
    return round(latency, 3), confidence, contradiction


def run_simulation(run_id: str, scale: int, seed: int | None = None) -> SimulationResult:
    config = _load_config()
    dataset = _load_dataset()
    seed_ctx = build_seed(seed)
    confidence_distribution: List[float] = []
    latency_map: Dict[str, List[float]] = {"alpha": [], "beta": [], "gamma": []}
    contradiction_map: List[Dict[str, str]] = []
    tier_failures: Dict[str, int] = {"alpha": 0, "beta": 0, "gamma": 0}

    for sample in dataset.get("samples", []):
        tier = sample.get("tier", seed_ctx.rng.choice(["alpha", "beta", "gamma"]))
        latency, confidence, contradiction = _simulate_toron_call(
            prompt=sample["prompt"], tier=tier, seed_ctx=seed_ctx, scale=scale
        )
        confidence_distribution.append(confidence)
        latency_map.setdefault(tier, []).append(latency)
        if contradiction:
            contradiction_map.append({"prompt": sample["prompt"], "tier": tier})
        if latency > config.get("latency_budget_ms", {}).get(tier, 250):
            tier_failures[tier] += 1

    determinism_baseline = determinism_fingerprint(confidence_distribution + sum(latency_map.values(), []))

    run_summary = {
        "latency_map": latency_map,
        "tier_failures": tier_failures,
        "contradiction_map": contradiction_map,
        "confidence_distribution": confidence_distribution,
        "determinism_baseline": determinism_baseline,
    }
    metrics, notes = evaluate_result(run_summary, scale=scale, seed=seed_ctx.seed)

    snapshot_path = save_snapshot(run_id, run_summary)
    json_report_path = Path(write_sim_report(run_id, {**run_summary, "metrics": metrics}))
    html_report_path = Path(
        write_sim_html_report(
            run_id,
            latency_map=latency_map,
            tier_failures=tier_failures,
            contradiction_map=contradiction_map,
            confidence_distribution=confidence_distribution,
            determinism_baseline=determinism_baseline,
            metrics=metrics,
        )
    )

    return SimulationResult(
        run_id=run_id,
        latency_map=latency_map,
        tier_failures=tier_failures,
        contradiction_map=contradiction_map,
        confidence_distribution=confidence_distribution,
        determinism_baseline=determinism_baseline,
        metrics=metrics,
        notes=notes,
        json_report_path=json_report_path,
        html_report_path=html_report_path,
    )


def run_full_suite() -> SimulationResult:
    """Execute the simulation for the entire Toron pipeline using config defaults."""

    config = _load_config()
    run_id = config.get("run_id", "toron_sim")
    scale = int(config.get("max_users", 10_000))
    return run_simulation(run_id=run_id, scale=scale, seed=config.get("seed"))
