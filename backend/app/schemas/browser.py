from pydantic import BaseModel, HttpUrl
from typing import Dict, Any, Optional, List

class CreateInstanceRequest(BaseModel):
    """Browser instance creation request"""
    count: int = 1

class VisitUrlRequest(BaseModel):
    """URL visit request"""
    url: HttpUrl

class BrowserResponse(BaseModel):
    """Browser instance information response"""
    id: str
    status: str
    current_url: Optional[str] = None
    fingerprint: Dict[str, Any]
    performance: Dict[str, Any]
    launch_time: str

class SystemStats(BaseModel):
    """System statistics"""
    total_instances: int
    running_instances: int
    cpu_usage: float
    memory_usage: float
    disk_usage: float

# 导出所有模型
__all__ = [
    'CreateInstanceRequest',
    'VisitUrlRequest',
    'BrowserResponse',
    'SystemStats'
]
