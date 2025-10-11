import ast
import collections
import os
import pathlib
from typing import List

import pytest


MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "nexus.ai" / "nexus_engine.py"

os.environ.setdefault("NEXUS_ALLOW_TEST_FALLBACKS", "1")


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


def test_engine_has_no_duplicate_uppercase_constants():
    tree = ast.parse(MODULE_PATH.read_text())
    seen = {}
    duplicates = []
    for node in tree.body:
        names: List[str] = []
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id.isupper():
                    names.append(target.id)
        elif isinstance(node, ast.AnnAssign):
            target = node.target
            if isinstance(target, ast.Name) and target.id.isupper():
                names.append(target.id)
        for name in names:
            if name in seen:
                duplicates.append(name)
            else:
                seen[name] = node.lineno
    assert not duplicates, f"Duplicate uppercase constants detected: {duplicates}"


def test_engine_specific_symbols_defined_once():
    tree = ast.parse(MODULE_PATH.read_text())

    # Count functions/classes
    symbol_counts = collections.Counter()
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            symbol_counts[node.name] += 1

    expected_symbols = [
        "_host_blocked",
        "_remaining_timeout",
        "_check_payload_size",
        "_limit_body",
        "_CircuitBreaker",
        "RateLimiter",
        "NexusError",
        "MisconfigurationError",
        "RateLimitExceeded",
        "VerificationError",
        "DeadlineExceeded",
        "CircuitOpenError",
        "PayloadTooLargeError",
        "ConnectorError",
    ]
    for name in expected_symbols:
        assert symbol_counts.get(name, 0) == 1, f"Expected exactly one definition of {name}, found {symbol_counts.get(name, 0)}"

    # Count uppercase constant assignments
    constant_counts = collections.Counter()
    for node in tree.body:
        targets: List[str] = []
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id.isupper():
                    targets.append(target.id)
        elif isinstance(node, ast.AnnAssign):
            target = node.target
            if isinstance(target, ast.Name) and target.id.isupper():
                targets.append(target.id)
        for target_name in targets:
            constant_counts[target_name] += 1

    expected_constants = [
        "MAX_MODEL_RESPONSE_BYTES",
        "MAX_MODEL_REQUEST_BYTES",
        "MAX_MODEL_TIMEOUT",
        "MAX_SCRAPE_BYTES",
        "MAX_DEADLINE_SECONDS",
    ]
    for const in expected_constants:
        assert constant_counts.get(const, 0) == 1, f"Expected exactly one assignment of {const}, found {constant_counts.get(const, 0)}"


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
