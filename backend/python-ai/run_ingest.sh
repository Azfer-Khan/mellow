#!/bin/bash
echo "MellowMind Document Ingestion Tool"
echo "===================================="

# Check if docs directory exists, if not create it
if [ ! -d "docs" ]; then
    echo "Creating docs directory..."
    mkdir -p docs
    echo "Please add your documents to the docs directory and run this script again."
    echo "Example document types: .txt, .md, .pdf, .html"
    read -p "Press Enter to continue..."
    exit 0
fi

# Run the ingest_docs.py script
echo "Running document ingestion..."
python ingest_docs.py --dir docs

echo ""
echo "Ingestion complete!"
echo "You can now start the API server with: uvicorn app:app --host 0.0.0.0 --port 8000"
read -p "Press Enter to continue..."
