"""
FastAPI dependencies for Mellow AI Service
"""

from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

# Re-export the database dependency for convenience
get_database = get_db

# Additional dependencies can be added here as needed
# For example: authentication, rate limiting, etc. 