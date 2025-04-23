from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Optional
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Load embedding model (use a small one for demo)
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# In-memory vector store for demo (replace with DB in prod)
documents = [
    {"id": 1, "text": "Deep breathing can help reduce anxiety."},
    {"id": 2, "text": "Journaling your thoughts is a healthy coping mechanism."},
    {"id": 3, "text": "Talking to a friend or therapist can provide support."},
    {"id": 4, "text": "Regular exercise is beneficial for mental health."},
]
doc_embeddings = np.vstack([embedder.encode(doc["text"]) for doc in documents])

class ConversationTurn(BaseModel):
    user_message: str
    ai_response: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ConversationTurn]] = None

@app.post("/generate-response")
async def generate_response(chat_request: ChatRequest):
    user_message = chat_request.message
    history = chat_request.history or []

    # Build a context string from history
    context = ""
    for turn in history:
        context += f"User: {turn.user_message}\nAI: {turn.ai_response}\n"
    if context:
        context += f"User: {user_message}\nAI: "
    else:
        context = f"User: {user_message}\nAI: "

    # Generate a supportive response referencing history
    ai_response = (
        "I'm here to listen. "
        + ("Here's what we've talked about so far: " + context if history else "")
        + f"You said: '{user_message}'. Remember, you're not alone!"
    )

    return {"response": ai_response}

# To run the server, use:
# uvicorn app:app --host 0.0.0.0 --port 8000
