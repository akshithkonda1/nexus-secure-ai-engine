"""Simulation runner that performs synthetic Toron calls."""
from __future__ import annotations

import asyncio
import json
import random
from pathlib import Path
from typing import Any, Callable, Dict, List, TypedDict

from testops.backend.simulators.sim_assertions import evaluate_assertions


class SimulationResult(TypedDict):
    run_id: str
    metrics: Dict[str, Any]
    assertions: List[Dict[str, Any]]


DATASET_PATH = Path(__file__).resolve().parent / "sim_dataset.json"


def load_dataset() -> Dict[str, Any]:
    with DATASET_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


async def run_simulation(run_id: str, log_callback: Callable[[str], None] | None = None) -> SimulationResult:
    dataset = load_dataset()
    metrics: Dict[str, Any] = {"responses": [], "scenarios": []}
    log = log_callback or (lambda msg: None)

    for scenario in dataset.get("scenarios", []):
        scenario_name = scenario.get("name", "unknown")
        log(f"Scenario {scenario_name} starting")
        scenario_steps = []
        for step in scenario.get("steps", []):
            await asyncio.sleep(step.get("duration_ms", 10) / 1000)
            response_time = step.get("duration_ms", 0) + random.uniform(1, 25)
            scenario_steps.append({"action": step.get("action"), "ms": response_time})
            metrics["responses"].append({"step": step.get("action"), "ms": response_time})
            log(f"Step {step.get('action')} completed in {response_time:.2f}ms")
        metrics["scenarios"].append({"name": scenario_name, "steps": scenario_steps})
        log(f"Scenario {scenario_name} finished")

    assertions = evaluate_assertions(metrics, dataset)
    log("Assertions calculated; preparing result envelope")

    return SimulationResult(run_id=run_id, metrics=metrics, assertions=assertions)


__all__ = ["run_simulation", "load_dataset", "SimulationResult"]
