"""API v1 endpoints initialization."""

from fastapi import APIRouter
from . import browser
from . import system

# Create v1 router
router = APIRouter()

# Register v1 endpoints
router.include_router(browser.router, prefix="/browser", tags=["browser"])
router.include_router(system.router, prefix="/system", tags=["system"])

__all__ = ['router']
