import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "database"
LOG_DIR = BASE_DIR / "logs" / "master"
WARROOM_DIR = BASE_DIR / "warroom" / "master"
REPORT_DIR = BASE_DIR / "reports" / "master"
SNAPSHOT_DIR = BASE_DIR / "snapshots"
SIM_DIR = BASE_DIR / "sim"
LOAD_DIR = BASE_DIR / "load"

DB_PATH = DATA_DIR / "tests_master.db"

# Ensure required directories exist at startup
for path in [DATA_DIR, LOG_DIR, WARROOM_DIR, REPORT_DIR, SNAPSHOT_DIR]:
    path.mkdir(parents=True, exist_ok=True)

# Create an empty SQLite file placeholder if missing to satisfy tooling expectations
if not DB_PATH.exists():
    DB_PATH.touch()

SIM_MAX_USERS = 10_000
LOAD_BASELINE_VUS = 1_500
LOAD_MAX_VUS = 10_000
