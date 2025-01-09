import os
from typing import Any
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Lei Browser API"
    DEBUG: bool = True

    # CORS settings
    BACKEND_CORS_ORIGINS: list = ["*"]

    # Browser settings
    MAX_INSTANCES: int = 10
    PROFILES_DIR: str = "./chrome_profiles"
    STATE_FILE: str = "./chrome_states.json"
    
    # Screen settings
    SCREEN_WIDTH: int = 1920
    SCREEN_HEIGHT: int = 1080
    GRID_COLS: int = 5
    GRID_ROWS: int = 2
    
    # Performance settings
    MAX_MEMORY_PER_INSTANCE: int = 512  # MB
    DEFAULT_ZOOM: float = 100.0
    ENCRYPT_PROFILES: bool = False

    # Security settings
    SECRET_KEY: str = "your-super-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Proxy settings
    PROXY_ENABLED: bool = False
    PROXY_URL: str = ""
    PROXY_AUTH: str = ""

    class Config:
        case_sensitive = True

settings = Settings()
