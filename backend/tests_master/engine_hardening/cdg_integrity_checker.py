from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path
from random import Random
from typing import Any, Dict, List, Set

try:
    from ..master_runner import LOG_DIR, RunState, master_runner
except Exception:  # pragma: no cover - fallback for isolated execution
    LOG_DIR = Path("backend/logs/master")
    master_runner = None
    RunState = None

LOG_DIR.mkdir(parents=True, exist_ok=True)
MODULE_LOG = LOG_DIR / "engine_hardening.log"


def _log(run_id: str, message: str) -> None:
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    line = f"[{timestamp}] [run:{run_id}] [cdg_integrity_checker] {message}\n"
    with MODULE_LOG.open("a", encoding="utf-8") as handle:
        handle.write(line)


def _register_result(run_id: str, payload: Dict[str, Any]) -> None:
    if not master_runner:
        return
    try:
        state = master_runner.run_states.get(run_id)
        if state is None and RunState:
            state = RunState(run_id=run_id)
            master_runner.run_states[run_id] = state
        if state is not None:
            state.results["cdg_integrity_checker"] = payload
    except Exception:
        return


@dataclass
class Graph:
    nodes: List[str]
    edges: Dict[str, List[str]]


def _generate_graph(rng: Random, size: int) -> Graph:
    nodes = [f"n{i}" for i in range(size)]
    edges: Dict[str, List[str]] = {n: [] for n in nodes}
    for node in nodes:
        for _ in range(rng.randint(0, 2)):
            target = rng.choice(nodes)
            if target != node and target not in edges[node]:
                edges[node].append(target)
    return Graph(nodes=nodes, edges=edges)


def _has_cycle(graph: Graph) -> bool:
    visited: Set[str] = set()
    stack: Set[str] = set()

    def visit(node: str) -> bool:
        if node in stack:
            return True
        if node in visited:
            return False
        visited.add(node)
        stack.add(node)
        for neighbor in graph.edges.get(node, []):
            if visit(neighbor):
                return True
        stack.remove(node)
        return False

    return any(visit(node) for node in graph.nodes)


def _has_missing_parent(graph: Graph) -> bool:
    for node, neighbors in graph.edges.items():
        for neighbor in neighbors:
            if neighbor not in graph.nodes:
                return True
    return False


def _has_paradox(graph: Graph) -> bool:
    for node, neighbors in graph.edges.items():
        if node in neighbors:
            return True
    return False


def run_cdg_integrity_checker(run_id: str = "offline", seed: int = 8282, graphs: int = 100) -> Dict[str, Any]:
    rng = Random(seed)
    results: List[Dict[str, Any]] = []
    clean_graphs = 0

    for idx in range(graphs):
        size = rng.randint(5, 12)
        graph = _generate_graph(rng, size)
        cycle = _has_cycle(graph)
        missing_parent = _has_missing_parent(graph)
        paradox = _has_paradox(graph)
        issues = [flag for flag, present in [
            ("cycle", cycle),
            ("missing_parent", missing_parent),
            ("paradox_node", paradox),
        ] if present]
        if not issues:
            clean_graphs += 1
        results.append({
            "id": idx,
            "size": size,
            "issues": issues,
            "edge_count": sum(len(v) for v in graph.edges.values()),
        })
        _log(run_id, f"graph {idx} issues: {issues or 'none'}")

    integrity_score = round(clean_graphs / graphs, 3)
    payload = {"integrity_score": integrity_score, "graphs_evaluated": graphs, "details": results, "seed": seed}
    _register_result(run_id, payload)
    return payload


__all__ = ["run_cdg_integrity_checker"]
