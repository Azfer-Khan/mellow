"""
Health check routes for Mellow AI Service
"""

from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.core.database import test_connection

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    
    Returns the status of the service and database connection
    """
    db_status = test_connection()
    return HealthResponse(
        status="healthy" if db_status else "unhealthy",
        database="connected" if db_status else "disconnected",
        service="python-ai"
    ) 