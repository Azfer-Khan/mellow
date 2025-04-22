from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from rag_service import RAGService

# Load environment variables
load_dotenv()

# Check for OpenAI API key
if not os.getenv("OPENAI_API_KEY"):
    print("WARNING: OPENAI_API_KEY not found in environment variables or .env file")
    print("The application will use fallback responses if no API key is provided")

app = FastAPI(title="MellowMind AI Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# Dependency to get RAG service
def get_rag_service():
    return RAGService(collection_name="mellow_docs")

@app.post("/generate-response")
async def generate_response(chat_request: ChatRequest, rag_service: RAGService = Depends(get_rag_service)):
    user_message = chat_request.message
    
    if not user_message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Generate response using RAG service
    ai_response = rag_service.generate_response(user_message)
    
    return {"response": ai_response}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# To run the server, use:
# uvicorn app:app --host 0.0.0.0 --port 8000
