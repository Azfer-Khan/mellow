from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.post("/generate-response")
async def generate_response(chat_request: ChatRequest):
    user_message = chat_request.message

    # Generate a canned supportive response.
    # Replace this logic later with your AI model inference.
    ai_response = f"I'm here to listen. You said: '{user_message}'. Remember, you're not alone!"

    return {"response": ai_response}

# To run the server, use:
# uvicorn app:app --host 0.0.0.0 --port 8000
