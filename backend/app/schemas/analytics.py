from pydantic import BaseModel
from typing import List, Dict, Any

class AnalyticsDataResponse(BaseModel):
    threatCategories: List[Dict[str, Any]]
    severityDistribution: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]
    topDomains: List[Dict[str, Any]]
