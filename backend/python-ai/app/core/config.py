"""
Configuration settings for Mellow AI Service
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings loaded from environment variables"""
    
    # Database settings
    DB_HOST: str = os.getenv('DB_HOST', 'localhost')
    DB_PORT: str = os.getenv('DB_PORT', '5432')
    DB_NAME: str = os.getenv('DB_NAME', 'mellow_db')
    DB_USER: str = os.getenv('DB_USER', 'mellow_user')
    DB_PASSWORD: str = os.getenv('DB_PASSWORD', 'mellow_password')
    
    # Application settings
    APP_TITLE: str = "Mellow AI Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Server settings
    HOST: str = os.getenv('HOST', '0.0.0.0')
    PORT: int = int(os.getenv('PORT', '8000'))
    
    # Gemini AI settings
    GEMINI_API_KEY: Optional[str] = os.getenv('GEMINI_API_KEY')
    GEMINI_MODEL: str = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
    GEMINI_MAX_TOKENS: int = int(os.getenv('GEMINI_MAX_TOKENS', '8000'))
    GEMINI_TEMPERATURE: float = float(os.getenv('GEMINI_TEMPERATURE', '0.7'))
    
    @property
    def database_url(self) -> str:
        """Generate database URL from individual components"""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

# Global settings instance
settings = Settings() 