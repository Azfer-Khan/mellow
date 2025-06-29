"""
Main FastAPI application for Mellow AI Service
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import test_connection
from app.api.routes import health, chat, analytics

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description="A FastAPI-based AI service for generating contextual responses and providing conversation analytics.",
    debug=settings.DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(analytics.router, tags=["Analytics"])

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    print(f"{settings.APP_TITLE} v{settings.APP_VERSION} starting up...")
    print(f"Database connection: {'✓' if test_connection() else '✗'}")
    print(f"Debug mode: {settings.DEBUG}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint providing service information"""
    return {
        "service": settings.APP_TITLE,
        "version": settings.APP_VERSION,
        "status": "running",
        "endpoints": [
            "/health",
            "/generate-response",
            "/conversations",
            "/analytics"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    ) 