from fastapi import APIRouter, Depends
from ..services import toron_service
from ..core.security import verify_api_key

router = APIRouter()


@router.get("/insights", dependencies=[Depends(verify_api_key)])
def get_insights(user_id: str = "demo-user"):
    return toron_service.get_insights(user_id)


@router.post("/analyze", dependencies=[Depends(verify_api_key)])
def analyze(user_id: str = "demo-user"):
    return toron_service.analyze_workspace(user_id)
