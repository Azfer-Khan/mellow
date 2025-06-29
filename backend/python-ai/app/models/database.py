"""
SQLAlchemy database models for Mellow AI Service
"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

# Base class for all models
Base = declarative_base()

class Conversation(Base):
    """
    Conversation model representing chat interactions
    
    Matches the schema used by the Node.js backend for consistency
    """
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Conversation(id={self.id}, timestamp={self.timestamp})>" 