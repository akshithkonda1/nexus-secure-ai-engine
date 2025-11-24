"""Admin routes for feedback system."""
from __future__ import annotations

from fastapi import APIRouter

from src.backend.feedback_system_v2.db_service import get_db_service
from src.backend.feedback_system_v2.digest import get_digest_generator
from src.backend.feedback_system_v2.exporter import get_exporter

router = APIRouter()

db_service = get_db_service()
digest_generator = get_digest_generator()
exporter = get_exporter()


@router.get("/feedback/admin/summary")
def feedback_summary() -> dict:
    digest = digest_generator.generate_digest()
    return {"summary": digest}


@router.get("/feedback/admin/all")
def feedback_all() -> dict:
    records = db_service.query_all()
    return {"records": records}


@router.get("/feedback/admin/export")
def feedback_export() -> dict:
    records = db_service.query_all()
    csv_export = exporter.to_csv(records)
    json_export = exporter.to_json(records)
    uploaded = exporter.upload_s3("feedback/export.csv", csv_export) if csv_export else False
    return {"csv": csv_export, "json": json_export, "uploaded": uploaded}
