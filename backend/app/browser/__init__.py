# File: leibrowser/browser/__init__.py
"""
Browser control module for LEIBrowser.
Contains all browser manipulation functionality.
"""

from .driver_manager import ChromeDriverManager
from .fingerprint import FingerprintGenerator
from .stealth import StealthBrowser
from .window_manager import WindowManager

__all__ = [
    'ChromeDriverManager',
    'FingerprintGenerator',
    'StealthBrowser',
    'WindowManager'
]