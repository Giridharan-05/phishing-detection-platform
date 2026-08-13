from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LogFileUploadResponse(BaseModel):
    message: str
    filename: str
    log_id: Optional[int] = None
    log_type: Optional[str] = "AUTO_DETECT"

class LogFileRecord(BaseModel):
    id: int
    filename: str
    log_type: str
    total_records: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
