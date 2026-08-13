from pydantic import BaseModel
from typing import List, Dict, Any

class DashboardMetrics(BaseModel):
    totalProcessed: int
    benignCount: int
    threatsCount: int
    criticalCount: int
    highCount: int
    cpuUsage: float
    memoryUsage: float

class DashboardStatsResponse(BaseModel):
    metrics: DashboardMetrics
    threatCategories: List[Dict[str, Any]]
    threatTrends: List[Dict[str, Any]]
    topMaliciousDomains: List[Dict[str, Any]]
    severityDistribution: List[Dict[str, Any]]
    recentThreatFeed: List[Dict[str, Any]]
    topAttackedIps: List[Dict[str, Any]]
