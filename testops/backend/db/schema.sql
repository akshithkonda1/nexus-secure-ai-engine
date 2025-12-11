CREATE TABLE IF NOT EXISTS test_runs (
    run_id TEXT PRIMARY KEY,
    status TEXT,
    started_at TEXT,
    ended_at TEXT,
    result_path TEXT,
    report_path TEXT
);
