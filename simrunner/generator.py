"""Deterministic synthetic prompt generator for Toron simulation."""
from __future__ import annotations

import json
import os
import random
from typing import List


TEMPLATES = [
    "Explain the principle of {concept} using an example from {field}.",
    "Solve the puzzle: {puzzle}? Provide reasoning.",
    "Compare {item1} and {item2} in terms of {dimension}.",
    "What are the risks of {scenario} and how to mitigate them?",
    "Generate a concise summary about {topic} considering {constraint}.",
    "Provide a counterargument to the claim: '{claim}'.",
    "Simulate a debate between a {role1} and a {role2} about {subject}.",
    "Predict outcomes when {variable} is doubled in {system}.",
]

VOCABULARY = {
    "concept": [
        "entropy",
        "emergent behavior",
        "Bayes' theorem",
        "causality",
        "non-Euclidean geometry",
        "quantum tunneling",
        "information theory",
        "ethics of AI",
    ],
    "field": [
        "thermodynamics",
        "economics",
        "astronomy",
        "classical music",
        "urban planning",
        "ecology",
        "linguistics",
        "psychology",
    ],
    "puzzle": [
        "Two doors and two guards",
        "the Monty Hall problem",
        "a knight and knave riddle",
        "an infinite hotel",
        "bridge crossing at night",
        "a paradoxical time loop",
        "weighing balls with a scale",
        "the fox, goose, and grain",
    ],
    "item1": [
        "breadth-first search",
        "depth-first search",
        "functional programming",
        "object-oriented programming",
        "hydrogen fuel",
        "lithium batteries",
        "socratic method",
        "peer review",
    ],
    "item2": [
        "breadth-first search",
        "depth-first search",
        "functional programming",
        "object-oriented programming",
        "hydrogen fuel",
        "lithium batteries",
        "socratic method",
        "peer review",
    ],
    "dimension": [
        "memory usage",
        "explainability",
        "long-term stability",
        "ethical risk",
        "computational complexity",
        "scalability",
        "historical impact",
        "robustness",
    ],
    "scenario": [
        "deploying autonomous drones",
        "allowing self-modifying code",
        "using black-box models in healthcare",
        "removing human oversight",
        "compressing safety logs",
        "training on synthetic data only",
        "releasing open weights",
        "delegating governance to AI",
    ],
    "topic": [
        "renaissance art",
        "quantum communication",
        "ocean acidification",
        "digital privacy",
        "ancient legal codes",
        "logic paradoxes",
        "distributed consensus",
        "cryptographic failures",
    ],
    "constraint": [
        "50 words",
        "avoid technical jargon",
        "focus on trade-offs",
        "use bullet points",
        "cite historical cases",
        "include equations",
        "assume limited compute",
        "assume resource scarcity",
    ],
    "claim": [
        "longer prompts always improve model accuracy",
        "humans are completely predictable",
        "ethics can be automated",
        "security through obscurity is sufficient",
        "determinism eliminates creativity",
        "open data removes all bias",
        "redundancy is wasteful",
        "speed matters more than correctness",
    ],
    "role1": [
        "philosopher",
        "safety engineer",
        "economist",
        "linguist",
        "medieval historian",
        "cybersecurity analyst",
        "ecologist",
        "logician",
    ],
    "role2": [
        "philosopher",
        "safety engineer",
        "economist",
        "linguist",
        "medieval historian",
        "cybersecurity analyst",
        "ecologist",
        "logician",
    ],
    "subject": [
        "data ownership",
        "algorithmic fairness",
        "automation of justice",
        "planetary governance",
        "digital immortality",
        "language preservation",
        "bio-surveillance",
        "fusion energy",
    ],
    "variable": [
        "signal latency",
        "training data diversity",
        "reward scaling",
        "population size",
        "feedback delay",
        "resource availability",
        "mutation rate",
        "sensor noise",
    ],
    "system": [
        "a multi-agent market",
        "a neural controller",
        "a supply chain",
        "a weather simulation",
        "a voting system",
        "a social network",
        "a closed-loop reactor",
        "an encrypted ledger",
    ],
}


def _choose(randomizer: random.Random, key: str) -> str:
    options = VOCABULARY[key]
    return options[randomizer.randint(0, len(options) - 1)]


def generate_prompts(count: int, seed: int = 42) -> List[str]:
    """Generate a deterministic list of prompts.

    Args:
        count: Number of prompts requested.
        seed: Seed for the deterministic PRNG.

    Returns:
        List of generated prompts.
    """

    if count <= 0:
        return []

    randomizer = random.Random(seed)
    prompts: List[str] = []

    for _ in range(count):
        template = TEMPLATES[randomizer.randint(0, len(TEMPLATES) - 1)]
        data = {name: _choose(randomizer, name) for name in VOCABULARY}
        prompts.append(template.format(**data))

    return prompts


def load_or_generate(dataset_path: str, count: int, seed: int) -> List[str]:
    """Load prompts from disk when available, otherwise generate deterministically."""
    if os.path.exists(dataset_path):
        try:
            with open(dataset_path, "r", encoding="utf-8") as handle:
                loaded = json.load(handle)
            if isinstance(loaded, list) and loaded:
                return loaded[:count]
        except Exception:
            # fall back to generation on any issue
            pass
    return generate_prompts(count, seed)


__all__ = ["generate_prompts", "load_or_generate"]
