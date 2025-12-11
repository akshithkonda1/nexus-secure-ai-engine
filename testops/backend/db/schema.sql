-- Final SQLite schema for Ryuzen Toron v2.5H+ TestOps Wave 3
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS test_runs (
    run_id TEXT PRIMARY KEY,
    status TEXT,
    started_at TEXT,
    ended_at TEXT,
    result_path TEXT,
    report_path TEXT,
    bundle_path TEXT
);

CREATE TABLE IF NOT EXISTS snapshots (
    run_id TEXT,
    snapshot_json TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS warroom_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT,
    severity TEXT,
    subsystem TEXT,
    message TEXT,
    suggestion TEXT,
    timestamp TEXT
);
