from .browser_manager import BrowserManager

# 创建全局单例
_browser_manager = None

def get_browser_manager():
    global _browser_manager
    if _browser_manager is None:
        _browser_manager = BrowserManager()
    return _browser_manager

__all__ = ['get_browser_manager']
