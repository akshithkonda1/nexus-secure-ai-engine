from fastapi import APIRouter, Depends
from ..services import lists_service
from ..core.security import verify_api_key

router = APIRouter()


@router.get("", dependencies=[Depends(verify_api_key)])
def list_lists(user_id: str = "demo-user"):
    return lists_service.get_lists(user_id)
