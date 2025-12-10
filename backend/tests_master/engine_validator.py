from typing import Any, Dict

from .engine_loader import EngineLoadError, load_engine_instance


def validate_engine() -> Dict[str, Any]:
    """
    Validate that the configured engine can be loaded and responds to a simple call.
    This MUST NOT make network calls or invoke real external APIs.
    """
    try:
        engine = load_engine_instance()
    except EngineLoadError as exc:
        return {
            "ok": False,
            "stage": "load_engine",
            "error": str(exc),
        }

    has_callable = any(
        hasattr(engine, attr) and callable(getattr(engine, attr))
        for attr in ("process", "run", "handle_request", "execute")
    )
    if not has_callable:
        return {
            "ok": True,
            "stage": "loaded",
            "warning": "Engine loaded but no known public processing method detected.",
        }

    try:
        test_prompt = "ENGINE_VALIDATION_PROBE"
        for attr in ("process", "run", "handle_request", "execute"):
            if hasattr(engine, attr) and callable(getattr(engine, attr)):
                method = getattr(engine, attr)
                _ = method(test_prompt)  # noqa: F841 - intentionally ignored
                break
    except Exception as exc:
        return {
            "ok": False,
            "stage": "dry_run",
            "error": f"Engine call failed: {exc}",
        }

    return {
        "ok": True,
        "stage": "validated",
        "message": "Engine loaded and responded to dry-run successfully.",
    }
