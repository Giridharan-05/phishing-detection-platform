from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.base import Base

class AnalysisSummary(Base):
    __tablename__ = "analysis_summaries"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("log_files.id", ondelete="CASCADE"), nullable=True)
    file_name = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    total_urls = Column(Integer, default=0)
    benign_count = Column(Integer, default=0)
    threat_count = Column(Integer, default=0)
    phishing_count = Column(Integer, default=0)
    malware_count = Column(Integer, default=0)
    c2_count = Column(Integer, default=0)
    exfiltration_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    malicious_percentage = Column(Float, default=0.0)
    processing_time = Column(String(50), default="0.0 sec")
    report_status = Column(String(50), default="completed")
