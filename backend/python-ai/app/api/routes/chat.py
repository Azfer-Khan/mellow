"""
Chat routes for Mellow AI Service
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.schemas import ChatRequest, ChatResponse, ConversationResponse
from app.api.dependencies import get_database
from app.services.ai_service import AIService
from app.services.conversation_service import ConversationService

router = APIRouter()

@router.post("/generate-response", response_model=ChatResponse)
async def generate_response(chat_request: ChatRequest, db: Session = Depends(get_database)):
    """
    Generate AI response to user message
    
    Args:
        chat_request: The chat request containing the user message
        db: Database session
        
    Returns:
        AI-generated response
    """
    try:
        user_message = chat_request.message.lower().strip()

        # Get recent conversation context (last 5 conversations)
        recent_conversations = ConversationService.get_conversation_context(db, limit=5)

        # Generate a contextual response
        ai_response = AIService.generate_contextual_response(user_message, recent_conversations)
        
        # Save the conversation to database
        ConversationService.save_conversation(db, chat_request.message, ai_response)

        return ChatResponse(response=ai_response)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(limit: int = 10, db: Session = Depends(get_database)):
    """
    Get recent conversations
    
    Args:
        limit: Maximum number of conversations to return
        db: Database session
        
    Returns:
        List of recent conversations
    """
    try:
        conversations = ConversationService.get_recent_conversations(db, limit=limit)
        return ConversationService.format_conversations_for_response(conversations)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: int, db: Session = Depends(get_database)):
    """
    Get a specific conversation by ID
    
    Args:
        conversation_id: The conversation ID
        db: Database session
        
    Returns:
        The conversation details
    """
    try:
        conversation = ConversationService.get_conversation_by_id(db, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return ConversationResponse(
            id=conversation.id,
            user_message=conversation.user_message,
            ai_response=conversation.ai_response,
            timestamp=conversation.timestamp.isoformat()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: int, db: Session = Depends(get_database)):
    """
    Delete a conversation by ID
    
    Args:
        conversation_id: The conversation ID to delete
        db: Database session
        
    Returns:
        Success message
    """
    try:
        success = ConversationService.delete_conversation(db, conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {"message": "Conversation deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 