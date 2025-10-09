import ast
import pathlib

import pytest


MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "nexus.ai" / "nexus_engine.py"


def _load_module():
    import importlib.util
    import sys

    existing = sys.modules.get("nexus.ai.nexus_engine")
    if existing:
        return existing

    spec = importlib.util.spec_from_file_location("nexus.ai.nexus_engine", MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_engine_has_no_duplicate_top_level_definitions():
    tree = ast.parse(MODULE_PATH.read_text())
    seen = {}
    duplicates = []
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            name = node.name
            if name in seen:
                duplicates.append(name)
            else:
                seen[name] = node.lineno
    assert not duplicates, f"Duplicate top-level definitions detected: {duplicates}"


def test_consensus_simple_policy_uses_blended_score(monkeypatch):
    engine_module = _load_module()
    policy = engine_module.ConsensusSimplePolicy()

    # Neutralise jaccard so bm25 drives the outcome.
    monkeypatch.setattr(policy, "_jac", lambda a, b: 0.0)

    def fake_bm25(answer_text, docs, *, k1=1.2, b=0.75):  # pragma: no cover - deterministic stub
        if answer_text == "candidate_a":
            return [0.0, 0.0]
        if answer_text == "candidate_b":
            return [0.0, 0.0]
        if answer_text == "candidate_c":
            return [1.0, 1.0]
        raise AssertionError("unexpected answer text")

    monkeypatch.setattr(engine_module, "_bm25_scores", fake_bm25)

    answers = {
        "a": "candidate_a",
        "b": "candidate_b",
        "c": "candidate_c",
    }

    result = policy.aggregate(
        "prompt",
        answers=answers,
        latencies={k: 0.5 for k in answers},
        errors={},
        metas={},
    )

    assert result["winner"] == "c"
    assert result["result"] == "candidate_c"
