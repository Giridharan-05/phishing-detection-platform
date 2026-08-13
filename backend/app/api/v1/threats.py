from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.threat import ThreatItem
from app.services.report_service import report_service

router = APIRouter(tags=["Threat Intelligence Feed"])

@router.get(
    "/threats",
    response_model=List[ThreatItem],
    status_code=status.HTTP_200_OK,
    summary="Get List of Detected Threat Incidents",
    description="Returns a list of malicious URL threat events detected from analyzed log files, including attack category, ML confidence score, severity rating, MITRE technique ID, and SOC mitigation playbook."
)
def get_threats(
    limit: int = Query(100, ge=1, le=1000, description="Max number of threat records to return"),
    db: Session = Depends(get_db)
):
    return report_service.get_threats_list(db, limit=limit)
