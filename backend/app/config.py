# File: backend/app/config.py
"""
Application configuration module.
"""
import os
from pathlib import Path
from typing import List

class Config:
    # Base configuration
    BASE_DIR = Path(__file__).parent
    PROJECT_DIR = BASE_DIR.parent
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Browser configuration
    PROFILES_DIR = PROJECT_DIR / "chrome_profiles"
    MAX_MEMORY_PER_INSTANCE = 512  # MB
    DEFAULT_ZOOM = 100  # Default zoom level
    ENCRYPT_PROFILES = False  # Whether to encrypt profiles
    
    # Window layout configuration
    SCREEN_WIDTH = 1920
    SCREEN_HEIGHT = 1080
    GRID_COLS = 5  # Grid columns
    GRID_ROWS = 2  # Grid rows
    
    # Proxy configuration
    PROXY_ENABLED = False
    PROXY_SERVERS: List[str] = []
    
    # Chrome configuration
    CHROME_DRIVER_PATH = None  # If None, download automatically
    CHROME_BINARY_PATH = None  # Chrome browser executable path
    
    # API configuration
    API_VERSION = "v1"
    API_PREFIX = f"/api/{API_VERSION}"
    
    # Logging configuration
    LOG_LEVEL = "INFO"
    LOG_DIR = PROJECT_DIR / "logs"
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE = LOG_DIR / "app.log"
    
    @classmethod
    def setup(cls):
        """Initialize configuration and necessary directories."""
        # Create necessary directories
        cls.PROFILES_DIR.mkdir(parents=True, exist_ok=True)
        cls.LOG_DIR.mkdir(parents=True, exist_ok=True)
        
        # Set proper permissions
        try:
            os.chmod(cls.PROFILES_DIR, 0o755)
            os.chmod(cls.LOG_DIR, 0o755)
        except Exception as e:
            print(f"Warning: Failed to set directory permissions: {e}")
    
    @classmethod
    def load_env(cls):
        """Load configuration from environment variables."""
        # Basic configuration
        cls.DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
        cls.MAX_MEMORY_PER_INSTANCE = int(os.getenv('MAX_MEMORY_PER_INSTANCE', '512'))
        cls.ENCRYPT_PROFILES = os.getenv('ENCRYPT_PROFILES', 'False').lower() == 'true'
        
        # Proxy configuration
        cls.PROXY_ENABLED = os.getenv('PROXY_ENABLED', 'False').lower() == 'true'
        proxy_servers = os.getenv('PROXY_SERVERS')
        if proxy_servers:
            cls.PROXY_SERVERS = proxy_servers.split(',')
            
        # Chrome configuration
        cls.CHROME_DRIVER_PATH = os.getenv('CHROME_DRIVER_PATH', cls.CHROME_DRIVER_PATH)
        cls.CHROME_BINARY_PATH = os.getenv('CHROME_BINARY_PATH', cls.CHROME_BINARY_PATH)
        
        # Logging configuration
        cls.LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
        
        # Window configuration
        cls.SCREEN_WIDTH = int(os.getenv('SCREEN_WIDTH', '1920'))
        cls.SCREEN_HEIGHT = int(os.getenv('SCREEN_HEIGHT', '1080'))
        cls.GRID_COLS = int(os.getenv('GRID_COLS', '5'))
        cls.GRID_ROWS = int(os.getenv('GRID_ROWS', '2'))

    @classmethod
    def get_profiles_dir(cls) -> Path:
        """Get profiles directory path."""
        return cls.PROFILES_DIR

    @classmethod
    def get_log_dir(cls) -> Path:
        """Get logs directory path."""
        return cls.LOG_DIR

    @classmethod
    def get_proxy_list(cls) -> List[str]:
        """Get list of proxy servers."""
        return cls.PROXY_SERVERS if cls.PROXY_ENABLED else []

    @classmethod
    def initialize(cls):
        """Complete initialization process."""
        cls.load_env()  # Load environment variables
        cls.setup()     # Create necessary directories

    @classmethod
    def get_chrome_paths(cls) -> tuple[str, str]:
        """Get Chrome and ChromeDriver paths."""
        return cls.CHROME_BINARY_PATH, cls.CHROME_DRIVER_PATH