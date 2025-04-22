@echo off
echo MellowMind Document Ingestion Tool
echo ====================================

REM Check if docs directory exists, if not create it
if not exist docs (
    echo Creating docs directory...
    mkdir docs
    echo Please add your documents to the docs directory and run this script again.
    echo Example document types: .txt, .md, .pdf, .html
    pause
    exit /b
)

REM Run the ingest_docs.py script
echo Running document ingestion...
python ingest_docs.py --dir docs

echo.
echo Ingestion complete!
echo You can now start the API server with: uvicorn app:app --host 0.0.0.0 --port 8000
pause
