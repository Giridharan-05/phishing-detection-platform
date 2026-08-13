from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.analytics import AnalyticsDataResponse
from app.services.report_service import report_service

router = APIRouter(tags=["Analytics & Visualization"])

@router.get(
    "/analytics",
    response_model=AnalyticsDataResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Graph-Ready Threat Analytics",
    description="Returns pre-formatted chart data objects optimized for frontend graph rendering: Threat Categories mix, Severity Distribution, Historical 7-day Timeline, and Top Malicious Domains."
)
def get_analytics(db: Session = Depends(get_db)):
    return report_service.get_analytics_data(db)
