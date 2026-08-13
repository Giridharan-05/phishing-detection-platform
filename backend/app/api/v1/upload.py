from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.log import LogFileUploadResponse
from app.services.log_service import log_service

router = APIRouter(tags=["Log Ingestion"])

@router.post(
    "/upload-log",
    response_model=LogFileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload SQUID or Bluecoat proxy log file",
    description="Uploads a raw web proxy log file (SQUID or Bluecoat format), validates size, and stores it in uploads/ repository."
)
def upload_log(
    file: UploadFile = File(..., description="Proxy log file (.log, .txt, .txt.gz)"),
    db: Session = Depends(get_db)
):
    record = log_service.save_uploaded_file(file, db)
    return LogFileUploadResponse(
        message="File uploaded successfully",
        filename=record.filename,
        log_id=record.id,
        log_type=record.log_type
    )
