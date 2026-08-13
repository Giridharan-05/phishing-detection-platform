from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.base import Base

class ThreatEvent(Base):
    __tablename__ = "threat_events"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("log_files.id", ondelete="CASCADE"), nullable=True)
    url = Column(String(2048), nullable=False, index=True)
    client_ip = Column(String(50), nullable=True, index=True)
    category = Column(String(100), nullable=False, index=True) # Benign, Phishing, Malware Distribution, Command and Control, Data Exfiltration
    confidence = Column(Float, nullable=False, default=0.0)
    severity = Column(String(50), nullable=False) # Critical, High, Medium, Low, Info
    severity_score = Column(Integer, default=0)
    mitre_technique = Column(String(50), nullable=True)
    recommendation = Column(String(512), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
