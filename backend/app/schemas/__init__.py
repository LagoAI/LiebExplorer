"""Schema package initialization."""

# Import models
from .browser import (
    BrowserResponse,     # 改为新的类名
    CreateInstanceRequest,
    VisitUrlRequest,
    SystemStats
)

# Export models
__all__ = [
    'BrowserResponse',   # 改为新的类名
    'CreateInstanceRequest',
    'VisitUrlRequest',
    'SystemStats'
]
