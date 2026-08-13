from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database.base import Base

class LogFile(Base):
    __tablename__ = "log_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    log_type = Column(String(50), default="AUTO_DETECT") # SQUID or BLUECOAT
    total_records = Column(Integer, default=0)
    status = Column(String(50), default="UPLOADED") # UPLOADED, PROCESSED, ERROR
    created_at = Column(DateTime(timezone=True), server_default=func.now())
