"""Logging configuration module."""

from pathlib import Path
from loguru import logger

def setup_logging(log_file: Path = None) -> None:
    """
    设置日志配置

    Args:
        log_file: 日志文件路径，如果为None则只输出到控制台
    """
    # 移除默认的sink
    logger.remove()

    # 添加控制台输出
    logger.add(
        sink=lambda msg: print(msg),
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
        colorize=True
    )

    # 如果指定了日志文件，添加文件输出
    if log_file:
        # 确保日志目录存在
        log_file.parent.mkdir(parents=True, exist_ok=True)
        
        logger.add(
            sink=str(log_file),
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            level="INFO",
            rotation="10 MB",  # 每10MB轮换一次
            compression="zip",  # 压缩旧日志
            retention="1 week"  # 保留1周的日志
        )

    # 设置第三方库的日志级别
    logger.disable("uvicorn")
    logger.disable("fastapi")
