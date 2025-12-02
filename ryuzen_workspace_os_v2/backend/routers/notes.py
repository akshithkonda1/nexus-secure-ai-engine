from fastapi import APIRouter, Depends
from ..services import pages_service
from ..core.security import verify_api_key

router = APIRouter()


@router.get("", dependencies=[Depends(verify_api_key)])
def list_notes(user_id: str = "demo-user"):
    return [page for page in pages_service.get_pages(user_id) if page.type == "note"]
