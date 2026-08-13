from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.dashboard import DashboardStatsResponse
from app.services.report_service import report_service

router = APIRouter(tags=["SOC Dashboard Overview"])

@router.get(
    "/dashboard",
    response_model=DashboardStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get SOC Dashboard Overview Metrics",
    description="Returns aggregate real-time KPI metrics (Total Processed, Benign count, Threats Flagged, Critical, High), threat category distribution, 7-day ingestion trend, top malicious domains, and system CPU/RAM load."
)
def get_dashboard(db: Session = Depends(get_db)):
    return report_service.get_dashboard_stats(db)
