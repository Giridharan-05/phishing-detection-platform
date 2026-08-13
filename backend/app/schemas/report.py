from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, Union

class HistoryReportItem(BaseModel):
    id: int
    report_name: str
    log_id: Optional[int] = None
    total_urls: int
    benign_count: int
    threat_count: int
    critical_count: int
    high_count: int
    created_at: datetime
    summary_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class HistorySummaryItem(BaseModel):
    id: int
    file_name: str
    analyzed_at: Union[datetime, str]
    total_urls: int
    benign: int
    threats: int
    phishing: int = 0
    malware: int = 0
    c2: int = 0
    exfiltration: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    malicious_percentage: float = 0.0
    processing_time: str = "0.0 sec"
    report_status: str = "completed"

    class Config:
        from_attributes = True

