# App package initialization
from fastapi import FastAPI
from .core import BrowserManager

__version__ = "1.0.0"

def get_version():
    return __version__
