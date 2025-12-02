from fastapi import APIRouter, Depends
from ..services import tasks_service
from ..core.security import verify_api_key

router = APIRouter()


@router.get("", dependencies=[Depends(verify_api_key)])
def list_tasks(user_id: str = "demo-user"):
    return tasks_service.get_tasks(user_id)
