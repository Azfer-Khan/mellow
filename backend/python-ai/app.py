from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db, test_connection, Conversation
import os
from typing import List, Optional

app = FastAPI(title="Mellow AI Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",     # React dev server
        "http://localhost:3001",     # Alternative React dev server
        "http://localhost:80",       # Docker frontend on port 80
        "http://localhost",          # Docker frontend without port
        "http://frontend",           # Docker service name
        "http://frontend:3000",      # Docker frontend service
        "http://frontend:80",        # Docker frontend on port 80
        "http://127.0.0.1:3000",     # Local IP
        "http://127.0.0.1:80",       # Local IP on port 80
        "http://127.0.0.1",          # Local IP without port
        "http://node-backend:3000",  # Node backend service
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

class ConversationResponse(BaseModel):
    id: int
    user_message: str
    ai_response: str
    timestamp: str

class AnalyticsResponse(BaseModel):
    total_conversations: int
    recent_conversations: int
    common_topics: List[str]

# Health check endpoint
@app.get("/health")
async def health_check():
    db_status = test_connection()
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected",
        "service": "python-ai"
    }

# Main chat endpoint
@app.post("/generate-response", response_model=ChatResponse)
async def generate_response(chat_request: ChatRequest, db: Session = Depends(get_db)):
    user_message = chat_request.message.lower().strip()

    # Get recent conversation context (last 5 conversations)
    recent_conversations = db.query(Conversation).order_by(
        Conversation.timestamp.desc()
    ).limit(5).all()

    # Generate a more contextual response based on message content
    ai_response = generate_contextual_response(user_message, recent_conversations)

    return ChatResponse(response=ai_response)

# Get conversation analytics
@app.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(db: Session = Depends(get_db)):
    try:
        # Total conversations
        total_conversations = db.query(Conversation).count()
        
        # Recent conversations (last 24 hours)
        from sqlalchemy import func
        from datetime import datetime, timedelta
        yesterday = datetime.now() - timedelta(days=1)
        recent_conversations = db.query(Conversation).filter(
            Conversation.timestamp >= yesterday
        ).count()
        
        # Simple topic extraction (basic keyword analysis)
        conversations = db.query(Conversation.user_message).limit(100).all()
        common_topics = extract_common_topics([conv.user_message for conv in conversations])
        
        return AnalyticsResponse(
            total_conversations=total_conversations,
            recent_conversations=recent_conversations,
            common_topics=common_topics
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

# Get recent conversations
@app.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(limit: int = 10, db: Session = Depends(get_db)):
    try:
        conversations = db.query(Conversation).order_by(
            Conversation.timestamp.desc()
        ).limit(limit).all()
        
        return [
            ConversationResponse(
                id=conv.id,
                user_message=conv.user_message,
                ai_response=conv.ai_response,
                timestamp=conv.timestamp.isoformat()
            )
            for conv in conversations
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def generate_contextual_response(user_message: str, recent_conversations: List[Conversation]) -> str:
    """Generate a more intelligent response based on user input and conversation history"""
    
    # Analyze user message for keywords and sentiment
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
    questions = ["how", "what", "when", "where", "why", "who"]
    emotions = ["sad", "happy", "angry", "frustrated", "excited", "worried", "anxious"]
    
    # Check for greetings
    if any(greeting in user_message for greeting in greetings):
        return "Hello! I'm here to listen and support you. How are you feeling today?"
    
    # Check for questions
    if any(question in user_message for question in questions):
        return f"That's a thoughtful question about '{user_message}'. While I don't have all the answers, I'm here to help you explore your thoughts and feelings about this."
    
    # Check for emotional content
    detected_emotions = [emotion for emotion in emotions if emotion in user_message]
    if detected_emotions:
        emotion = detected_emotions[0]
        responses = {
            "sad": "I hear that you're feeling sad. That's completely valid. Would you like to talk about what's making you feel this way?",
            "happy": "I'm glad to hear you're feeling happy! It's wonderful to share positive moments. What's bringing you joy today?",
            "angry": "It sounds like you're feeling angry. Those feelings are important and valid. Sometimes it helps to talk through what's causing these feelings.",
            "frustrated": "Frustration can be really difficult to deal with. I'm here to listen. What's been causing you to feel this way?",
            "excited": "Your excitement is contagious! I'd love to hear more about what has you feeling so excited.",
            "worried": "I understand that you're feeling worried. It's natural to have concerns. Would you like to share what's on your mind?",
            "anxious": "Anxiety can be overwhelming. Remember that you're not alone, and it's okay to feel this way. What's been making you feel anxious?"
        }
        return responses.get(emotion, f"I notice you mentioned feeling {emotion}. I'm here to listen and support you through whatever you're experiencing.")
    
    # Check if this seems to be a continuation of previous conversation
    if recent_conversations and len(recent_conversations) > 0:
        last_message = recent_conversations[0].user_message.lower()
        if len(user_message.split()) < 5 and any(word in last_message for word in user_message.split()):
            return "I see you're continuing our previous conversation. Please feel free to share more about what you're thinking or feeling."
    
    # Default supportive response
    supportive_responses = [
        f"Thank you for sharing that with me. Your thoughts about '{user_message}' are important. How does talking about this make you feel?",
        f"I appreciate you opening up about '{user_message}'. I'm here to listen without judgment. What would be most helpful for you right now?",
        f"It sounds like you have a lot on your mind regarding '{user_message}'. Sometimes it helps to talk through our thoughts. I'm here for you.",
        f"I hear you talking about '{user_message}'. Your feelings and experiences are valid. Would you like to explore this topic further?"
    ]
    
    # Simple hash to pick consistent response for similar inputs
    response_index = len(user_message) % len(supportive_responses)
    return supportive_responses[response_index]

def extract_common_topics(messages: List[str]) -> List[str]:
    """Extract common topics from conversation messages"""
    if not messages:
        return []
    
    # Simple keyword extraction
    common_words = {}
    stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "i", "you", "we", "they", "he", "she", "it", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "am", "this", "that", "these", "those"}
    
    for message in messages:
        words = message.lower().split()
        for word in words:
            # Clean word
            word = ''.join(c for c in word if c.isalnum())
            if len(word) > 3 and word not in stop_words:
                common_words[word] = common_words.get(word, 0) + 1
    
    # Return top 5 most common topics
    sorted_topics = sorted(common_words.items(), key=lambda x: x[1], reverse=True)
    return [topic[0] for topic in sorted_topics[:5]]

# Startup event
@app.on_event("startup")
async def startup_event():
    print("Python AI Service starting up...")
    print(f"Database connection: {'✓' if test_connection() else '✗'}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
