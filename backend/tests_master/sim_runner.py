import time, random
from hashlib import sha256


def run_single_simulation(engine, seed: int):
    random.seed(seed)

    # Build synthetic prompt
    prompt = f"SIMTEST-{seed}-Explain coherence vs truth."

    t_start = time.time()

    # Simulated Tier 1 raw
    t1_raw = [
        {"model": "Claude-Sonnet-4.5", "hypothesis": "Coherence is internal consistency."},
        {"model": "GPT-5.1", "hypothesis": "Truth matches external reality."},
    ]

    # Simulated Tier 2
    t2 = {"audit": "No contradictions", "missing_steps": []}

    # Simulated reality packet
    reality = {"verified_facts": ["Coherence != truth"], "evidence_weight": 0.88}

    # Synthesis
    synthesis = {
        "objective": "Coherence refers to internal consistency; truth refers to accuracy about reality.",
        "human": "Coherence = internal consistency; truth = matching reality."
    }

    # Simulate latency deterministically
    latency = 250 + (seed % 40)

    # Confidence score
    confidence = 88 + (seed % 4)

    # Meta flags
    flags = ["stable"]

    snapshot = {
        "prompt": prompt,
        "t1_raw": t1_raw,
        "t2": t2,
        "reality": reality,
        "synthesis": synthesis,
        "latency_ms": latency,
        "confidence": confidence,
        "meta_flags": flags
    }

    return snapshot
