"""
Application configuration module.
"""
import os
from pathlib import Path
from typing import List

class Config:
   # 基本配置
   BASE_DIR = Path(__file__).parent
   PROJECT_DIR = BASE_DIR.parent
   DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
   
   # 浏览器配置
   PROFILES_DIR = PROJECT_DIR / "chrome_profiles"
   MAX_MEMORY_PER_INSTANCE = 512  # MB
   DEFAULT_ZOOM = 100  # 默认缩放比例
   ENCRYPT_PROFILES = False  # 是否加密配置文件
   
   # 窗口布局配置
   SCREEN_WIDTH = 1920
   SCREEN_HEIGHT = 1080
   GRID_COLS = 5  # 网格列数
   GRID_ROWS = 2  # 网格行数
   
   # 代理配置
   PROXY_ENABLED = False
   PROXY_SERVERS: List[str] = []
   
   # Chrome配置
   CHROME_DRIVER_PATH = None  # 如果为None则自动下载
   CHROME_BINARY_PATH = None  # Chrome浏览器可执行文件路径
   
   # API配置
   API_VERSION = "v1"
   API_PREFIX = f"/api/{API_VERSION}"
   
   # 日志配置
   LOG_LEVEL = "INFO"
   LOG_DIR = PROJECT_DIR / "logs"
   LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
   LOG_FILE = LOG_DIR / "app.log"
   
   @classmethod
   def setup(cls):
       """初始化配置和必要的目录"""
       # 创建必要的目录
       cls.PROFILES_DIR.mkdir(parents=True, exist_ok=True)
       cls.LOG_DIR.mkdir(parents=True, exist_ok=True)
   
   @classmethod
   def load_env(cls):
       """从环境变量加载配置"""
       # 从环境变量加载配置
       cls.DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
       cls.MAX_MEMORY_PER_INSTANCE = int(os.getenv('MAX_MEMORY_PER_INSTANCE', '512'))
       cls.ENCRYPT_PROFILES = os.getenv('ENCRYPT_PROFILES', 'False').lower() == 'true'
       
       # 代理配置
       cls.PROXY_ENABLED = os.getenv('PROXY_ENABLED', 'False').lower() == 'true'
       proxy_servers = os.getenv('PROXY_SERVERS')
       if proxy_servers:
           cls.PROXY_SERVERS = proxy_servers.split(',')
           
       # Chrome配置
       cls.CHROME_DRIVER_PATH = os.getenv('CHROME_DRIVER_PATH', cls.CHROME_DRIVER_PATH)
       cls.CHROME_BINARY_PATH = os.getenv('CHROME_BINARY_PATH', cls.CHROME_BINARY_PATH)
       
       # 日志配置
       cls.LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

   @classmethod
   def get_profiles_dir(cls) -> Path:
       """获取配置文件目录"""
       return cls.PROFILES_DIR

   @classmethod
   def get_log_dir(cls) -> Path:
       """获取日志目录"""
       return cls.LOG_DIR

   @classmethod
   def initialize(cls):
       """完整的初始化过程"""
       cls.load_env()  # 加载环境变量
       cls.setup()     # 创建必要目录
