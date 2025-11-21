"""CORS middleware configuration for the backend API layer.

Note: The current configuration is development-friendly and allows any origin.
In production deployments, tighten this policy by restricting allowed origins
and enabling credentials only when explicitly required.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def apply_cors(app: FastAPI) -> None:
    """Apply permissive CORS for development-time integration.

    This keeps browser, mobile, desktop, CLI, and automation clients unblocked
    while the engine API stabilizes. Replace the wildcard configuration with a
    vetted list of origins when promoting to production.
    """

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

