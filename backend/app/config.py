import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Identification of URL-Based Attacks from IP Data Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database Settings (SQLite fallback if PostgreSQL isn't running)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./psp_soc.db")
    
    # Storage settings
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
    
    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure uploads directory exists on config load
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
