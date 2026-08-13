from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any, Union

class AnalysisSummaryData(BaseModel):
    total_urls: int
    benign: int
    threats: int
    phishing: int
    malware: int
    c2: int
    exfiltration: int
    critical: int
    high: int
    medium: int
    low: int
    malicious_percentage: float
    processing_time: str

class ThreatItem(BaseModel):
    url: str
    client_ip: Optional[str] = "192.168.1.100"
    prediction: str # Category: Benign, Phishing, Malware, Command and Control, Data Exfiltration
    confidence: float # 0 - 100%
    severity: str # Critical, High, Medium, Low
    severity_score: Optional[int] = 0
    mitre: str # T1105, T1566, etc.
    recommendation: str

    class Config:
        from_attributes = True

class AnalyzeLogRequest(BaseModel):
    filename: Optional[str] = "proxy.log"

class AnalyzeLogResponse(BaseModel):
    status: str = "completed"
    file_name: str
    analysis_summary: AnalysisSummaryData
    summary: Optional[Dict[str, Any]] = None
    threats: Optional[List[ThreatItem]] = None

