"""Telemetry blueprint for logging anonymised debate metrics."""
from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timezone
from typing import Optional

from flask import Blueprint, Flask, current_app, jsonify, request
from pydantic import BaseModel, Field, ValidationError, field_validator

TELEMETRY_DB_SCHEMA = """
CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_hash TEXT NOT NULL,
    scores_json TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    opt_in INTEGER NOT NULL
);
"""

TELEMETRY_QUEUE_KEY = "telemetry:queue"
QUEUE_TTL_SECONDS = 60 * 60 * 24 * 30  # 30 days

telemetry_bp = Blueprint("telemetry", __name__)


class TelemetryPayload(BaseModel):
    """Pydantic payload model for telemetry submissions."""

    query_hash: Optional[str] = Field(default=None, min_length=1)
    scores: list[float]
    duration_ms: int = Field(..., ge=0)
    opt_in: bool

    @field_validator("scores")
    @classmethod
    def validate_scores(cls, value: list[float]) -> list[float]:
        scores = list(value)
        if not scores:
            raise ValueError("scores must contain at least one value")
        for score in scores:
            if not 0.0 <= float(score) <= 1.0:
                raise ValueError("scores must be within [0, 1]")
        return scores


class TelemetryRepository:
    """Lightweight repository for interacting with SQLite telemetry storage."""

    def __init__(self, db_path: str) -> None:
        self._db_path = db_path
        self._ensure_schema()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self._db_path, detect_types=sqlite3.PARSE_DECLTYPES)

    def _ensure_schema(self) -> None:
        os.makedirs(os.path.dirname(self._db_path), exist_ok=True)
        with self._connect() as connection:
            connection.executescript(TELEMETRY_DB_SCHEMA)

    def insert(self, payload: TelemetryPayload, computed_hash: str) -> None:
        with self._connect() as connection:
            connection.execute(
                "INSERT INTO telemetry (query_hash, scores_json, duration_ms, created_at, opt_in)"
                " VALUES (?, ?, ?, ?, ?)",
                (
                    computed_hash,
                    json.dumps(list(payload.scores)),
                    payload.duration_ms,
                    datetime.now(timezone.utc).isoformat(),
                    int(payload.opt_in),
                ),
            )
            connection.commit()


def _resolve_query_hash(payload: TelemetryPayload) -> str:
    import hashlib

    if payload.query_hash:
        return payload.query_hash

    fingerprint_source = json.dumps(
        {
            "scores": list(payload.scores),
            "duration_ms": payload.duration_ms,
        },
        sort_keys=True,
    )
    return hashlib.sha256(fingerprint_source.encode("utf-8")).hexdigest()


def _serialise_errors(errors: list[dict]) -> list[dict]:
    """Normalise Pydantic error payloads for JSON serialization."""

    serialised: list[dict] = []
    for error in errors:
        item = dict(error)
        ctx = item.get("ctx")
        if isinstance(ctx, dict):
            item["ctx"] = {
                key: (str(value) if isinstance(value, Exception) else value)
                for key, value in ctx.items()
            }
        serialised.append(item)
    return serialised


def init_telemetry(app: Flask, redis_client) -> None:
    """Initialise telemetry dependencies for the Flask app."""

    db_path = os.getenv("TELEMETRY_DB_PATH")
    if not db_path:
        os.makedirs(app.instance_path, exist_ok=True)
        db_directory = os.path.join(app.instance_path, "data")
        os.makedirs(db_directory, exist_ok=True)
        db_path = os.path.join(db_directory, "telemetry.db")
    app.config["TELEMETRY_DB_PATH"] = db_path
    app.config["TELEMETRY_REPOSITORY"] = TelemetryRepository(db_path)
    app.config["TELEMETRY_REDIS"] = redis_client


@telemetry_bp.route("/api/telemetry", methods=["POST"])
def log_telemetry() -> tuple:
    """Persist telemetry payloads if the caller opted in."""

    payload = request.get_json(silent=True) or {}
    try:
        validated = TelemetryPayload.model_validate(payload)
    except ValidationError as exc:
        current_app.logger.warning("Telemetry payload validation failed: %s", exc)
        return jsonify({"error": "invalid_payload", "details": _serialise_errors(exc.errors())}), 400

    query_hash = _resolve_query_hash(validated)

    redis_client = current_app.config.get("TELEMETRY_REDIS")
    if redis_client:
        redis_client.lpush(
            TELEMETRY_QUEUE_KEY,
            json.dumps(
                {
                    "query_hash": query_hash,
                    "scores": list(validated.scores),
                    "duration_ms": validated.duration_ms,
                    "opt_in": validated.opt_in,
                    "logged_at": datetime.now(timezone.utc).isoformat(),
                }
            ),
        )
        redis_client.expire(TELEMETRY_QUEUE_KEY, QUEUE_TTL_SECONDS)

    if validated.opt_in:
        repository: TelemetryRepository = current_app.config["TELEMETRY_REPOSITORY"]
        repository.insert(validated, query_hash)

    return jsonify({"status": "logged", "query_hash": query_hash}), 200


__all__ = ["init_telemetry", "telemetry_bp", "TelemetryRepository", "TelemetryPayload"]
