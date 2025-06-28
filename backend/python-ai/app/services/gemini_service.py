"""
Gemini AI service for generating responses using Google's Generative AI
"""

import google.generativeai as genai
from typing import List, Optional
import logging
from app.core.config import settings
from app.models.database import Conversation

# Configure logging
logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google's Gemini AI"""
    
    def __init__(self):
        """Initialize Gemini service with API key and configuration"""
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not found. Gemini service will not be available.")
            self.model = None
            return
            
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            logger.info(f"Gemini service initialized with model: {settings.GEMINI_MODEL}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini service: {str(e)}")
            self.model = None
    
    def is_available(self) -> bool:
        """Check if Gemini service is available"""
        return self.model is not None
    
    def generate_response(self, user_message: str, conversation_context: List[Conversation] = None) -> Optional[str]:
        """
        Generate a response using Gemini AI
        
        Args:
            user_message: The user's input message
            conversation_context: Recent conversation history for context
            
        Returns:
            Generated response or None if service is unavailable
        """
        if not self.is_available():
            logger.warning("Gemini service is not available")
            return None
            
        try:
            # Build the system prompt for mental health support
            system_prompt = self._build_system_prompt()
            
            # Build conversation context
            context_string = self._build_context_string(conversation_context)
            
            # Create the full prompt
            full_prompt = f"{system_prompt}\n\n{context_string}\n\nUser: {user_message}\n\nAssistant:"
            
            # Generate response
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=settings.GEMINI_MAX_TOKENS,
                    temperature=settings.GEMINI_TEMPERATURE,
                )
            )
            
            if response and response.text:
                logger.info("Successfully generated response using Gemini")
                return response.text.strip()
            else:
                logger.warning("Gemini returned empty response")
                return None
                
        except Exception as e:
            logger.error(f"Error generating Gemini response: {str(e)}")
            return None
    
    def _build_system_prompt(self) -> str:
        """Build the system prompt for mental health support"""
        return """You are Mellow, a compassionate AI assistant designed to provide mental health support and emotional guidance. Your role is to:

1. Listen empathetically and without judgment
2. Provide emotional support and validation
3. Help users explore their thoughts and feelings
4. Offer gentle guidance and coping strategies
5. Encourage professional help when appropriate

Guidelines:
- Always be warm, understanding, and non-judgmental
- Always be professional and make the conversation as real as possible. And make sure to keep it flowing and natural.
- Validate the user's feelings and experiences
- Ask thoughtful follow-up questions to help users reflect
- Provide practical coping strategies when appropriate
- Recognize when someone may need professional help and gently suggest it
- Maintain appropriate boundaries - you're supportive but not a replacement for therapy
- Keep responses conversational and not overly clinical
- Focus on the user's emotional well-being and mental health

Remember: You are here to support, listen, diagnose, and guide and to provide medical advice. With medical advice you will ask to consult doctor on `azfer@mellow.com`"""
    
    def _build_context_string(self, conversation_context: List[Conversation]) -> str:
        """
        Build context string from recent conversations
        
        Args:
            conversation_context: List of recent conversations
            
        Returns:
            Formatted context string
        """
        if not conversation_context:
            return "This is the beginning of a new conversation."
        
        context_parts = ["Recent conversation history:"]
        
        # Add recent conversations (newest first, but we want to show oldest first in context)
        for conversation in reversed(conversation_context[-3:]):  # Last 3 conversations
            context_parts.append(f"User: {conversation.user_message}")
            context_parts.append(f"Assistant: {conversation.ai_response}")
        
        context_parts.append("\nContinuing the conversation:")
        
        return "\n".join(context_parts)

# Global instance
gemini_service = GeminiService() 