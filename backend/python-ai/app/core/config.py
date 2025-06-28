"""
Configuration settings for Mellow AI Service
"""

import os
from typing import Optional

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
    
    @property
    def database_url(self) -> str:
        """Generate database URL from individual components"""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

# Global settings instance
settings = Settings() 