
def assert_confidence_valid(conf):
    assert 0 <= conf <= 100, f"Invalid confidence: {conf}"


def assert_t1_valid(t1):
    assert isinstance(t1, list) and len(t1) > 0, "T1 empty or invalid"


def assert_synthesis_valid(syn):
    assert "objective" in syn and "human" in syn, "Invalid synthesis"


def assert_latency_valid(lat):
    assert lat > 0, "Latency must be positive"


def assert_snapshot_structure(snap):
    required = ["prompt","t1_raw","t2","reality","synthesis","latency_ms","confidence","meta_flags"]
    for r in required:
        assert r in snap, f"Missing {r}"
