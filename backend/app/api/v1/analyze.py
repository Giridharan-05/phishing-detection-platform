from fastapi import APIRouter, Depends, Body, status
from sqlalchemy.orm import Session
from typing import Optional
from app.api.deps import get_db
from app.schemas.threat import AnalyzeLogRequest, AnalyzeLogResponse
from app.services.analysis_service import analysis_service

router = APIRouter(tags=["Log Analysis Engine"])

@router.post(
    "/analyze-log",
    response_model=AnalyzeLogResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute ML Threat Detection Pipeline on Proxy Log",
    description="Triggers the complete security analysis pipeline: Parses SQUID/Bluecoat log entries, extracts 11 URL security features, generates ML attack predictions, calculates severity scores, maps MITRE ATT&CK techniques, generates SOC mitigation recommendations, and archives results."
)
def analyze_log(
    payload: Optional[AnalyzeLogRequest] = Body(None),
    db: Session = Depends(get_db)
):
    filename = payload.filename if (payload and payload.filename) else "proxy.log"
    results = analysis_service.analyze_log_file(filename, db)
    return AnalyzeLogResponse(**results)
