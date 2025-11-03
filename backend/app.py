"""Application entry point for Nexus.ai backend services."""
from __future__ import annotations

import logging
import logging.handlers
import os
from datetime import datetime
from typing import Iterable, Optional

from dotenv import load_dotenv
from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis

from .abuse_middleware import register_abuse_guard
from pydantic import ValidationError

from .services.debate_service import DebateRequest, DebateService
from .telemetry import init_telemetry, telemetry_bp

load_dotenv()


def _configure_logging(app: Flask) -> None:
    """Configure structured logging for the Flask application."""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    app.logger.setLevel(log_level)

    if not app.logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
        )
        handler.setFormatter(formatter)
        app.logger.addHandler(handler)

    log_directory = os.getenv("LOG_DIRECTORY", "logs")
    os.makedirs(log_directory, exist_ok=True)
    file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_directory, "backend.log"), maxBytes=5 * 1024 * 1024, backupCount=3
    )
    file_handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    )
    app.logger.addHandler(file_handler)


def _create_redis_client() -> redis.Redis:
    """Create a Redis client instance configured from environment variables."""
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    return redis.from_url(redis_url, decode_responses=True)


def create_app(
    redis_client: Optional[redis.Redis] = None,
    llm_clients: Optional[Iterable] = None,
    limiter_storage_uri: Optional[str] = None,
) -> Flask:
    """Application factory used by production and tests.

    Args:
        redis_client: Optional Redis client to reuse during tests.
        llm_clients: Optional iterable of model clients injected for testing.
    """
    app = Flask(__name__)
    CORS(app)
    _configure_logging(app)

    redis_client = redis_client or _create_redis_client()
    app.config["REDIS_CLIENT"] = redis_client

    beta_unlimited = os.getenv("BETA_UNLIMITED", "false").lower() in {"true", "1", "yes"}
    app.config["BETA_UNLIMITED"] = beta_unlimited

    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=[] if beta_unlimited else ["120 per minute"],
        storage_uri=limiter_storage_uri or os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    )
    limiter.init_app(app)
    if beta_unlimited:
        limiter.enabled = False

    register_abuse_guard(app, redis_client)

    debate_service = DebateService(redis_client=redis_client, llm_clients=llm_clients)

    debate_bp = Blueprint("debate", __name__)

    @debate_bp.route("/api/debate", methods=["POST"])
    def debate() -> tuple:
        payload = request.get_json(silent=True) or {}
        try:
            debate_request = DebateRequest.model_validate(payload)
        except ValidationError as exc:
            app.logger.warning("Debate payload validation failed: %s", exc)
            return jsonify({"error": "invalid_request", "details": exc.errors()}), 400

        hashed_query = debate_service.hash_query(debate_request.query)
        app.logger.info("Beta mode: %s, query: %s", beta_unlimited, hashed_query)

        try:
            response = debate_service.run_debate(
                debate_request.query,
                beta_unlimited=beta_unlimited,
            )
        except DebateService.RetriableProviderError as exc:
            app.logger.error("Provider failure after retries for query %s", hashed_query, exc_info=exc)
            return jsonify({"error": "provider_failure", "message": str(exc)}), 502
        except DebateService.DebateServiceError as exc:  # pragma: no cover - defensive
            app.logger.error("Debate service error for query %s", hashed_query, exc_info=exc)
            return jsonify({"error": "internal_error", "message": str(exc)}), 500

        return jsonify(response.model_dump()), 200

    app.register_blueprint(debate_bp)

    init_telemetry(app, redis_client)
    app.register_blueprint(telemetry_bp)

    @app.get("/health")
    def health() -> tuple:
        now = datetime.utcnow().isoformat()
        return jsonify({"status": "ok", "timestamp": now}), 200

    return app


__all__ = ["create_app"]
