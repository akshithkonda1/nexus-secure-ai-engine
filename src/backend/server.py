"""Lightweight Flask server for the Toron engine demo."""

from flask import Flask, jsonify

from toron import (
    CloudProviderAdapter,
    ConnectorRegistry,
    EngineConfig,
    PIIPipeline,
    Retriever,
    TokenBucket,
    ToronEngine,
)


def create_app() -> Flask:
    app = Flask(__name__)
    config = EngineConfig()
    engine = ToronEngine(
        config=config,
        connectors=ConnectorRegistry.default(),
        adapter=CloudProviderAdapter(),
        pii_pipeline=PIIPipeline(),
        retriever=Retriever(session=None),  # Session is injected during runtime usage
        rate_limiter=TokenBucket(capacity=100, fill_rate=10),
    )

    @app.route("/health", methods=["GET"])
    def health() -> tuple[dict, int]:
        return {"status": "ok", "version": engine.metadata.get("version", "1.6")}, 200

    @app.route("/bootstrap", methods=["GET"])
    def bootstrap() -> tuple[dict, int]:
        return jsonify(engine.bootstrap()), 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=EngineConfig().port)
