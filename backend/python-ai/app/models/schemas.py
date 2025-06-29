"""
Pydantic schemas for API request/response models
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatRequest(BaseModel):
    """Request schema for chat endpoints"""
    message: str

class ChatResponse(BaseModel):
    """Response schema for chat endpoints"""
    response: str

class ConversationResponse(BaseModel):
    """Response schema for conversation data"""
    id: int
    user_message: str
    ai_response: str
    timestamp: str

class AnalyticsResponse(BaseModel):
    """Response schema for analytics data"""
    total_conversations: int
    recent_conversations: int
    common_topics: List[str]

class HealthResponse(BaseModel):
    """Response schema for health check"""
    status: str
    database: str
    service: str 