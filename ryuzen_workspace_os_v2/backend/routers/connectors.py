from fastapi import APIRouter, Depends
from ..services import connectors_service
from ..core.security import verify_api_key

router = APIRouter()


@router.get("", dependencies=[Depends(verify_api_key)])
def connector_status(user_id: str = "demo-user"):
    return connectors_service.get_connector_status(user_id)
