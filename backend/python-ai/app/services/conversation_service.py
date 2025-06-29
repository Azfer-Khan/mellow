"""
Conversation management service for Mellow AI Service
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.database import Conversation
from app.models.schemas import ConversationResponse

class ConversationService:
    """Service for managing conversation data and operations"""
    
    @staticmethod
    def get_recent_conversations(db: Session, limit: int = 10) -> List[Conversation]:
        """
        Get recent conversations from the database
        
        Args:
            db: Database session
            limit: Maximum number of conversations to return
            
        Returns:
            List of recent Conversation objects
        """
        return db.query(Conversation).order_by(
            Conversation.timestamp.desc()
        ).limit(limit).all()
    
    @staticmethod
    def get_conversation_context(db: Session, limit: int = 5) -> List[Conversation]:
        """
        Get recent conversations for context in AI response generation
        
        Args:
            db: Database session
            limit: Maximum number of conversations for context
            
        Returns:
            List of recent Conversation objects for context
        """
        return db.query(Conversation).order_by(
            Conversation.timestamp.desc()
        ).limit(limit).all()
    
    @staticmethod
    def save_conversation(db: Session, user_message: str, ai_response: str) -> Conversation:
        """
        Save a new conversation to the database
        
        Args:
            db: Database session
            user_message: The user's message
            ai_response: The AI's response
            
        Returns:
            The saved Conversation object
        """
        conversation = Conversation(
            user_message=user_message,
            ai_response=ai_response
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation
    
    @staticmethod
    def format_conversations_for_response(conversations: List[Conversation]) -> List[ConversationResponse]:
        """
        Format conversation objects for API response
        
        Args:
            conversations: List of Conversation objects
            
        Returns:
            List of ConversationResponse objects
        """
        return [
            ConversationResponse(
                id=conv.id,
                user_message=conv.user_message,
                ai_response=conv.ai_response,
                timestamp=conv.timestamp.isoformat()
            )
            for conv in conversations
        ]
    
    @staticmethod
    def get_conversation_by_id(db: Session, conversation_id: int) -> Optional[Conversation]:
        """
        Get a specific conversation by ID
        
        Args:
            db: Database session
            conversation_id: The conversation ID to retrieve
            
        Returns:
            Conversation object if found, None otherwise
        """
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()
    
    @staticmethod
    def delete_conversation(db: Session, conversation_id: int) -> bool:
        """
        Delete a conversation by ID
        
        Args:
            db: Database session
            conversation_id: The conversation ID to delete
            
        Returns:
            True if deleted successfully, False if not found
        """
        conversation = ConversationService.get_conversation_by_id(db, conversation_id)
        if conversation:
            db.delete(conversation)
            db.commit()
            return True
        return False 