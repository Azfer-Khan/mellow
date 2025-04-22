import os
import openai
from dotenv import load_dotenv
from vector_store import VectorStore

# Load environment variables from .env file if present
load_dotenv()

# Set OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

class RAGService:
    def __init__(self, collection_name="mellow_docs"):
        """Initialize the RAG service with a vector store.
        
        Args:
            collection_name: Name of the collection to use in the vector store
        """
        self.vector_store = VectorStore(collection_name=collection_name)
        self.system_prompt = """
        You are MellowMind, an empathetic AI mental health assistant. 
        Your primary goal is to provide supportive, compassionate responses to users 
        who may be experiencing anxiety, stress, or other mental health challenges.
        
        Use the provided context to inform your responses, but always prioritize being:
        1. Supportive and validating of the user's feelings
        2. Non-judgmental and empathetic
        3. Encouraging but realistic
        4. Focused on the user's well-being
        
        If you don't know something or the context doesn't provide relevant information, 
        be honest about your limitations while remaining supportive.
        
        Never claim to be a licensed therapist or medical professional. If the user appears 
        to be in crisis or mentions self-harm, gently suggest professional help.
        """
    
    def generate_response(self, user_message):
        """Generate a response to the user message using RAG.
        
        Args:
            user_message: The message from the user
            
        Returns:
            AI-generated response
        """
        # Check if vector store has documents
        if self.vector_store.get_collection_count() == 0:
            # Fallback to canned response if no documents
            return f"I'm here to listen. You said: '{user_message}'. Remember, you're not alone!"
        
        # Retrieve relevant documents
        relevant_docs = self.vector_store.similarity_search(user_message, k=3)
        
        # Extract just the text from the results
        context_texts = [doc for doc, _ in relevant_docs]
        
        # Build context string
        context = "\n\n---\n\n".join(context_texts)
        
        # Build the prompt with context
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "system", "content": f"Context information is below:\n\n{context}\n\nGiven this information, answer the user's query."},
            {"role": "user", "content": user_message}
        ]
        
        try:
            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",  # Can be configured to use different models
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            # Extract the response text
            ai_response = response.choices[0].message.content.strip()
            return ai_response
            
        except Exception as e:
            print(f"Error generating response: {e}")
            # Fallback response in case of API error
            return f"I'm here to support you. You mentioned: '{user_message}'. I'm having trouble right now, but I'm still here to listen."
