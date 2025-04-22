import os
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import openai
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# Set OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

class VectorStore:
    def __init__(self, collection_name="mellow_docs", persist_directory=None):
        """Initialize the vector store with ChromaDB.
        
        Args:
            collection_name: Name of the collection to use
            persist_directory: Directory to persist the database, if None uses in-memory DB
        """
        self.collection_name = collection_name
        self.persist_directory = persist_directory or os.getenv("CHROMA_PATH", "./chroma_db")
        
        # Initialize the embedding function (OpenAI)
        self.embedding_function = embedding_functions.OpenAIEmbeddingFunction(
            api_key=openai.api_key,
            model_name="text-embedding-ada-002"
        )
        
        # Initialize ChromaDB client
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=self.persist_directory
        ))
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            embedding_function=self.embedding_function
        )
    
    def add_texts(self, texts, metadatas=None, ids=None):
        """Add texts to the vector store.
        
        Args:
            texts: List of text chunks to add
            metadatas: Optional list of metadata dicts for each text
            ids: Optional list of IDs for each text, if None will be auto-generated
        
        Returns:
            List of IDs of the added texts
        """
        if not texts:
            return []
            
        # Generate IDs if not provided
        if ids is None:
            import uuid
            ids = [str(uuid.uuid4()) for _ in texts]
        
        # Ensure metadatas is provided for each text
        if metadatas is None:
            metadatas = [{} for _ in texts]
        
        # Add documents to collection
        self.collection.add(
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
        
        return ids
    
    def similarity_search(self, query, k=3):
        """Search for similar documents to the query.
        
        Args:
            query: The query text
            k: Number of results to return
            
        Returns:
            List of (document, metadata) tuples
        """
        # Query the collection
        results = self.collection.query(
            query_texts=[query],
            n_results=k
        )
        
        documents = results.get('documents', [[]])[0]
        metadatas = results.get('metadatas', [[]])[0]
        
        # Return as list of (document, metadata) tuples
        return list(zip(documents, metadatas))
    
    def get_collection_count(self):
        """Get the number of documents in the collection."""
        return self.collection.count()
