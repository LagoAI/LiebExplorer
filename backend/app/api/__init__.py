"""API route registration and initialization."""

from fastapi import APIRouter
from .v1 import router as v1_router

# Create main API router
api_router = APIRouter()

# Register all route modules
api_router.include_router(v1_router)

# Export for use in main app
__all__ = ['api_router']
