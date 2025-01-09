"""
Core business logic module initialization.
Contains main business logic handlers and managers.
"""

from .browser_manager import BrowserManager
from ..config import Config

# Export core components
__all__ = [
    'BrowserManager',
    'Config',
    'get_browser_manager'
]

# Global browser manager instance
_browser_manager = None

def get_browser_manager() -> BrowserManager:
    """
    Get or create the global browser manager instance.
    Uses singleton pattern to ensure only one manager exists.

    Returns:
        BrowserManager: The global browser manager instance
    """
    global _browser_manager
    if _browser_manager is None:
        _browser_manager = BrowserManager()
    return _browser_manager
