from fastapi import APIRouter
from app.api.v1 import upload, analyze, dashboard, threats, analytics, history

api_router = APIRouter()

api_router.include_router(upload.router)
api_router.include_router(analyze.router)
api_router.include_router(dashboard.router)
api_router.include_router(threats.router)
api_router.include_router(analytics.router)
api_router.include_router(history.router)
