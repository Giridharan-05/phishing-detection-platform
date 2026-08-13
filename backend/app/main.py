import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import engine
from app.database.base import Base
from app.api.v1.router import api_router
from app.utils.logger import logger

# Import models to ensure metadata registration
import app.models

# Auto-create DB tables on startup
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except Exception as e:
    logger.error(f"Failed to auto-create database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
## Identification of URL-Based Attacks from IP Data - Backend API

This platform analyzes web proxy access logs (SQUID & Bluecoat format), extracts 11 URL security features, performs Machine Learning threat classification, computes severity scores, maps MITRE ATT&CK techniques, and generates SOC mitigation playbooks.

### Key Endpoints:
* **POST /upload-log**: Ingest raw SQUID or Bluecoat proxy log files.
* **POST /analyze-log**: Execute end-to-end ML prediction & security analysis pipeline.
* **GET /dashboard**: Real-time SOC dashboard metrics & system stats.
* **GET /threats**: List detected threat events with mitigation recommendations.
* **GET /analytics**: Graph-ready dataset objects for visual dashboards.
* **GET /history**: Chronological audit trail of past log analysis reports.
""",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/prototype environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router under /api/v1 and also at root / for direct REST calls
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router)

@app.get("/", tags=["System Health"])
def root_health_check():
    return {
        "status": "ONLINE",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "database": settings.DATABASE_URL.split("://")[0]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
