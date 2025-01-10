# File: backend/app/utils/logger.py
"""Logging configuration module."""

from pathlib import Path
from loguru import logger
from app.config import Config

def setup_logging(log_file: Path = None) -> None:
    """
    Setup logging configuration.
    
    Args:
        log_file: Optional log file path. If None, only output to console.
    """
    # Remove default sink
    logger.remove()
    
    # Add console output with colors
    logger.add(
        sink=lambda msg: print(msg),
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
               "<level>{level: <8}</level> | "
               "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
               "<level>{message}</level>",
        level=Config.LOG_LEVEL,
        colorize=True
    )
    
    # Add file output if log file is specified
    if log_file:
        # Ensure log directory exists
        log_file.parent.mkdir(parents=True, exist_ok=True)
        
        logger.add(
            sink=str(log_file),
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | "
                  "{name}:{function}:{line} - {message}",
            level=Config.LOG_LEVEL,
            rotation="10 MB",      # Rotate every 10MB
            compression="zip",     # Compress old logs
            retention="1 week",    # Keep logs for 1 week
            encoding="utf-8"       # Ensure proper encoding
        )
    else:
        # If no log_file provided, use default from Config
        log_file = Config.LOG_FILE
        log_file.parent.mkdir(parents=True, exist_ok=True)
        
        logger.add(
            sink=str(log_file),
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | "
                  "{name}:{function}:{line} - {message}",
            level=Config.LOG_LEVEL,
            rotation="10 MB",
            compression="zip",
            retention="1 week",
            encoding="utf-8"
        )
    
    # Set log levels for third-party libraries
    logger.disable("uvicorn")
    logger.disable("fastapi")
    logger.disable("selenium")  # Disable selenium's verbose logging
    
    # Log initialization
    logger.info("Logging system initialized")
    if log_file:
        logger.info(f"Log file: {log_file}")

def get_logger():
    """Get configured logger instance."""
    return logger

# Example usage:
# from app.utils.logger import setup_logging, get_logger
# setup_logging()
# logger = get_logger()
# logger.info("Message")