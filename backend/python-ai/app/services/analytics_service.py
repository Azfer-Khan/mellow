"""
Analytics service for conversation analysis and insights
"""

from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.database import Conversation
from app.utils.text_processing import extract_common_topics

class AnalyticsService:
    """Service for generating conversation analytics and insights"""
    
    @staticmethod
    def get_conversation_analytics(db: Session) -> dict:
        """
        Get comprehensive analytics about conversations
        
        Args:
            db: Database session
            
        Returns:
            Dictionary containing analytics data
        """
        # Total conversations
        total_conversations = db.query(Conversation).count()
        
        # Recent conversations (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        recent_conversations = db.query(Conversation).filter(
            Conversation.timestamp >= yesterday
        ).count()
        
        # Simple topic extraction (basic keyword analysis)
        conversations = db.query(Conversation.user_message).limit(100).all()
        common_topics = extract_common_topics([conv.user_message for conv in conversations])
        
        return {
            "total_conversations": total_conversations,
            "recent_conversations": recent_conversations,
            "common_topics": common_topics
        }
    
    @staticmethod
    def get_conversation_trends(db: Session, days: int = 7) -> dict:
        """
        Get conversation trends over specified number of days
        
        Args:
            db: Database session
            days: Number of days to analyze
            
        Returns:
            Dictionary containing trend data
        """
        start_date = datetime.now() - timedelta(days=days)
        
        # Get conversations per day
        daily_conversations = db.query(
            func.date(Conversation.timestamp).label('date'),
            func.count(Conversation.id).label('count')
        ).filter(
            Conversation.timestamp >= start_date
        ).group_by(
            func.date(Conversation.timestamp)
        ).all()
        
        return {
            "period_days": days,
            "daily_conversations": [
                {"date": str(day.date), "count": day.count}
                for day in daily_conversations
            ]
        }
    
    @staticmethod
    def get_message_insights(db: Session) -> dict:
        """
        Get insights about message patterns and characteristics
        
        Args:
            db: Database session
            
        Returns:
            Dictionary containing message insights
        """
        # Get recent messages for analysis
        recent_messages = db.query(Conversation.user_message).limit(100).all()
        messages = [msg.user_message for msg in recent_messages]
        
        if not messages:
            return {
                "average_message_length": 0,
                "total_analyzed": 0,
                "emotion_distribution": {}
            }
        
        # Calculate average message length
        avg_length = sum(len(msg.split()) for msg in messages) / len(messages)
        
        # Simple emotion detection
        emotions = ["sad", "happy", "angry", "frustrated", "excited", "worried", "anxious"]
        emotion_counts = {}
        
        for message in messages:
            message_lower = message.lower()
            for emotion in emotions:
                if emotion in message_lower:
                    emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        return {
            "average_message_length": round(avg_length, 2),
            "total_analyzed": len(messages),
            "emotion_distribution": emotion_counts
        } 