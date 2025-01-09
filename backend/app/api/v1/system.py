from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

from app.core.browser_manager import BrowserManager
from app.schemas.browser import SystemStats
router = APIRouter()

class SystemStats(BaseModel):
    total_instances: int
    running_instances: int
    cpu_usage: float
    memory_usage: float
    disk_usage: float

@router.get("/stats", response_model=SystemStats)
async def get_system_stats():
    """获取系统状态信息"""
    instances = browser_manager.get_all_instances()
    running_instances = sum(1 for i in instances.values() if i['status'] == 'running')
    
    return {
        "total_instances": len(instances),
        "running_instances": running_instances,
        "cpu_usage": psutil.cpu_percent(),
        "memory_usage": psutil.virtual_memory().percent,
        "disk_usage": psutil.disk_usage('/').percent
    }

@router.get("/performance")
async def get_performance_metrics():
    """获取详细性能指标"""
    return {
        "cpu": {
            "percent": psutil.cpu_percent(interval=1, percpu=True),
            "frequency": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None,
            "count": psutil.cpu_count()
        },
        "memory": {
            "total": psutil.virtual_memory().total,
            "available": psutil.virtual_memory().available,
            "percent": psutil.virtual_memory().percent,
            "used": psutil.virtual_memory().used,
            "free": psutil.virtual_memory().free
        },
        "disk": {
            "total": psutil.disk_usage('/').total,
            "used": psutil.disk_usage('/').used,
            "free": psutil.disk_usage('/').free,
            "percent": psutil.disk_usage('/').percent
        },
        "network": {
            "bytes_sent": psutil.net_io_counters().bytes_sent,
            "bytes_recv": psutil.net_io_counters().bytes_recv,
            "packets_sent": psutil.net_io_counters().packets_sent,
            "packets_recv": psutil.net_io_counters().packets_recv
        }
    }
