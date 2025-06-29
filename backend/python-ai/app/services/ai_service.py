"""
AI response generation service for Mellow AI Service
"""

import logging
from typing import List
from app.models.database import Conversation
from app.utils.text_processing import detect_message_intent
from app.services.gemini_service import gemini_service

# Configure logging
logger = logging.getLogger(__name__)

class AIService:
    """Service for generating AI responses to user messages"""
    
    @staticmethod
    def generate_contextual_response(user_message: str, recent_conversations: List[Conversation]) -> str:
        """
        Generate a response using Gemini AI with fallback to static responses
        
        Args:
            user_message: The user's input message
            recent_conversations: List of recent conversation objects for context
            
        Returns:
            Generated AI response string
        """
        # Try to generate response using Gemini first
        if gemini_service.is_available():
            try:
                gemini_response = gemini_service.generate_response(user_message, recent_conversations)
                if gemini_response:
                    print("Using Gemini-generated response")
                    return gemini_response
                else:
                    print("Gemini returned empty response, falling back to static responses")
            except Exception as e:
                print(f"Error with Gemini service: {str(e)}, falling back to static responses")
        else:
            print("Gemini service not available, using static responses")
        
        # Fallback to static responses
        return AIService._generate_static_response(user_message, recent_conversations)
    
    @staticmethod
    def _generate_static_response(user_message: str, recent_conversations: List[Conversation]) -> str:
        """
        Generate a static response based on user input and conversation history (fallback method)
        
        Args:
            user_message: The user's input message
            recent_conversations: List of recent conversation objects for context
            
        Returns:
            Generated static response string
        """
        # Analyze the message for intent and emotions
        intent = detect_message_intent(user_message)
        
        # Check for greetings
        if intent["is_greeting"]:
            return "Hello! I'm here to listen and support you. How are you feeling today?"
        
        # Check for questions
        if intent["is_question"]:
            return f"That's a thoughtful question about '{user_message}'. While I don't have all the answers, I'm here to help you explore your thoughts and feelings about this."
        
        # Check for emotional content
        if intent["detected_emotions"]:
            emotion = intent["detected_emotions"][0]
            return AIService._get_emotion_response(emotion, user_message)
        
        # Check if this seems to be a continuation of previous conversation
        if recent_conversations and len(recent_conversations) > 0 and intent["is_short_response"]:
            last_message = recent_conversations[0].user_message.lower()
            if any(word in last_message for word in user_message.lower().split()):
                return "I see you're continuing our previous conversation. Please feel free to share more about what you're thinking or feeling."
        
        # Default supportive response
        return AIService._get_supportive_response(user_message)
    
    @staticmethod
    def _get_emotion_response(emotion: str, user_message: str) -> str:
        """
        Get a response tailored to the detected emotion
        
        Args:
            emotion: The detected emotion
            user_message: The original user message
            
        Returns:
            Emotion-appropriate response
        """
        responses = {
            "sad": "I hear that you're feeling sad. That's completely valid. Would you like to talk about what's making you feel this way?",
            "happy": "I'm glad to hear you're feeling happy! It's wonderful to share positive moments. What's bringing you joy today?",
            "angry": "It sounds like you're feeling angry. Those feelings are important and valid. Sometimes it helps to talk through what's causing these feelings.",
            "frustrated": "Frustration can be really difficult to deal with. I'm here to listen. What's been causing you to feel this way?",
            "excited": "Your excitement is contagious! I'd love to hear more about what has you feeling so excited.",
            "worried": "I understand that you're feeling worried. It's natural to have concerns. Would you like to share what's on your mind?",
            "anxious": "Anxiety can be overwhelming. Remember that you're not alone, and it's okay to feel this way. What's been making you feel anxious?"
        }
        
        return responses.get(
            emotion, 
            f"I notice you mentioned feeling {emotion}. I'm here to listen and support you through whatever you're experiencing."
        )
    
    @staticmethod
    def _get_supportive_response(user_message: str) -> str:
        """
        Get a general supportive response
        
        Args:
            user_message: The user's message
            
        Returns:
            A supportive response
        """
        supportive_responses = [
            f"Thank you for sharing that with me. Your thoughts about '{user_message}' are important. How does talking about this make you feel?",
            f"I appreciate you opening up about '{user_message}'. I'm here to listen without judgment. What would be most helpful for you right now?",
            f"It sounds like you have a lot on your mind regarding '{user_message}'. Sometimes it helps to talk through our thoughts. I'm here for you.",
            f"I hear you talking about '{user_message}'. Your feelings and experiences are valid. Would you like to explore this topic further?"
        ]
        
        # Simple hash to pick consistent response for similar inputs
        response_index = len(user_message) % len(supportive_responses)
        return supportive_responses[response_index] 