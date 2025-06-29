"""
Analytics routes for Mellow AI Service
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.schemas import AnalyticsResponse
from app.api.dependencies import get_database
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(db: Session = Depends(get_database)):
    """
    Get conversation analytics
    
    Args:
        db: Database session
        
    Returns:
        Analytics data including conversation counts and common topics
    """
    try:
        analytics_data = AnalyticsService.get_conversation_analytics(db)
        
        return AnalyticsResponse(
            total_conversations=analytics_data["total_conversations"],
            recent_conversations=analytics_data["recent_conversations"],
            common_topics=analytics_data["common_topics"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

@router.get("/analytics/trends")
async def get_conversation_trends(days: int = 7, db: Session = Depends(get_database)):
    """
    Get conversation trends over specified period
    
    Args:
        days: Number of days to analyze (default: 7)
        db: Database session
        
    Returns:
        Trend data for the specified period
    """
    try:
        if days < 1 or days > 365:
            raise HTTPException(status_code=400, detail="Days must be between 1 and 365")
            
        trends_data = AnalyticsService.get_conversation_trends(db, days)
        return trends_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

@router.get("/analytics/insights")
async def get_message_insights(db: Session = Depends(get_database)):
    """
    Get insights about message patterns and characteristics
    
    Args:
        db: Database session
        
    Returns:
        Message insights including length analysis and emotion distribution
    """
    try:
        insights_data = AnalyticsService.get_message_insights(db)
        return insights_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}") 