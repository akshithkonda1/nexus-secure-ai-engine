from fastapi import APIRouter, Depends
from ..services import calendar_service
from ..core.security import verify_api_key

router = APIRouter()


@router.get("", dependencies=[Depends(verify_api_key)])
def list_events(user_id: str = "demo-user"):
    return calendar_service.get_events(user_id)
