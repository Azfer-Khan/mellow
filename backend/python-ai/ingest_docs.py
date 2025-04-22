import os
import argparse
import tiktoken
import glob
from typing import List, Dict, Tuple
from vector_store import VectorStore

# Initialize the tokenizer for chunking
tokenizer = tiktoken.get_encoding("cl100k_base")

def tokenize(text: str) -> List[int]:
    """Tokenize text using the cl100k_base tokenizer."""
    return tokenizer.encode(text)

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into chunks of approximately chunk_size tokens with overlap.
    
    Args:
        text: The text to split
        chunk_size: Target size of each chunk in tokens
        overlap: Number of tokens to overlap between chunks
        
    Returns:
        List of text chunks
    """
    # Tokenize the text
    tokens = tokenize(text)
    
    # If text is smaller than chunk_size, return it as is
    if len(tokens) <= chunk_size:
        return [text]
    
    # Split into chunks
    chunks = []
    for i in range(0, len(tokens), chunk_size - overlap):
        # Get chunk tokens
        chunk_tokens = tokens[i:i + chunk_size]
        # Decode back to text
        chunk_text = tokenizer.decode(chunk_tokens)
        chunks.append(chunk_text)
        
        # If we've processed all tokens, break
        if i + chunk_size >= len(tokens):
            break
    
    return chunks

def read_file(file_path: str) -> str:
    """Read a file and return its contents as a string."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""

def process_file(file_path: str, chunk_size: int = 500) -> List[Tuple[str, Dict]]:
    """Process a single file into chunks with metadata.
    
    Args:
        file_path: Path to the file
        chunk_size: Size of each chunk in tokens
        
    Returns:
        List of (chunk, metadata) tuples
    """
    # Read the file
    content = read_file(file_path)
    if not content:
        return []
    
    # Create metadata
    metadata = {
        "source": file_path,
        "filename": os.path.basename(file_path),
        "filetype": os.path.splitext(file_path)[1][1:]
    }
    
    # Chunk the content
    chunks = chunk_text(content, chunk_size=chunk_size)
    
    # Create chunk-metadata pairs
    result = []
    for i, chunk in enumerate(chunks):
        chunk_metadata = metadata.copy()
        chunk_metadata["chunk_index"] = i
        chunk_metadata["chunk_count"] = len(chunks)
        result.append((chunk, chunk_metadata))
    
    return result

def process_directory(directory: str, extensions: List[str] = None, chunk_size: int = 500) -> List[Tuple[str, Dict]]:
    """Process all files in a directory recursively.
    
    Args:
        directory: Directory to process
        extensions: List of file extensions to include (without dot)
        chunk_size: Size of each chunk in tokens
        
    Returns:
        List of (chunk, metadata) tuples
    """
    if extensions is None:
        extensions = ["txt", "md", "pdf", "html", "htm"]
    
    # Create glob patterns for each extension
    patterns = [os.path.join(directory, f"**/*.{ext}") for ext in extensions]
    
    # Find all matching files
    all_files = []
    for pattern in patterns:
        all_files.extend(glob.glob(pattern, recursive=True))
    
    # Process each file
    all_chunks = []
    for file_path in all_files:
        print(f"Processing {file_path}")
        chunks = process_file(file_path, chunk_size=chunk_size)
        all_chunks.extend(chunks)
    
    return all_chunks

def main():
    parser = argparse.ArgumentParser(description="Ingest documents into the vector store")
    parser.add_argument("--dir", type=str, default="./docs", help="Directory containing documents to ingest")
    parser.add_argument("--chunk-size", type=int, default=500, help="Size of each chunk in tokens")
    parser.add_argument("--collection", type=str, default="mellow_docs", help="Name of the collection in ChromaDB")
    parser.add_argument("--extensions", type=str, default="txt,md,pdf,html,htm", help="Comma-separated list of file extensions to process")
    
    args = parser.parse_args()
    
    # Parse extensions
    extensions = args.extensions.split(",")
    
    # Process the directory
    print(f"Processing directory: {args.dir}")
    chunks_with_metadata = process_directory(
        directory=args.dir,
        extensions=extensions,
        chunk_size=args.chunk_size
    )
    
    if not chunks_with_metadata:
        print("No documents found or processed.")
        return
    
    # Initialize vector store
    vector_store = VectorStore(collection_name=args.collection)
    
    # Separate chunks and metadata
    chunks = [chunk for chunk, _ in chunks_with_metadata]
    metadatas = [metadata for _, metadata in chunks_with_metadata]
    
    # Add to vector store
    print(f"Adding {len(chunks)} chunks to vector store...")
    vector_store.add_texts(chunks, metadatas=metadatas)
    
    print(f"Successfully added {len(chunks)} chunks to the vector store.")
    print(f"Total documents in collection: {vector_store.get_collection_count()}")

if __name__ == "__main__":
    main()
