from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.report import HistorySummaryItem
from app.services.report_service import report_service

router = APIRouter(tags=["Historical Reports"])

@router.get(
    "/history",
    response_model=List[HistorySummaryItem],
    status_code=status.HTTP_200_OK,
    summary="Get Audit History of Log Analysis Summaries",
    description="Returns a chronological list of all previously executed proxy log security analysis summaries stored in the database."
)
def get_history(db: Session = Depends(get_db)):
    return report_service.get_analysis_history(db)

@router.get(
    "/history/{analysis_id}",
    response_model=HistorySummaryItem,
    status_code=status.HTTP_200_OK,
    summary="Get Complete Analysis Summary by ID",
    description="Returns the complete analysis summary statistics for a specific previously analyzed log file by its ID."
)
def get_history_summary_by_id(
    analysis_id: int = Path(..., description="ID of the analysis summary record to retrieve"),
    db: Session = Depends(get_db)
):
    return report_service.get_analysis_summary_by_id(db, analysis_id)

