from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
from typing import Dict, Any
from pathlib import Path

from .core import BrowserManager
from .api import api_router
from .config import Config

# 初始化配置
Config.initialize()

# 全局浏览器管理器实例
browser_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    应用生命周期管理
    在应用启动时初始化浏览器管理器，在应用关闭时清理资源
    """
    global browser_manager
    try:
        browser_manager = BrowserManager()
        yield
    finally:
        if browser_manager:
            browser_manager.cleanup()

app = FastAPI(
    title="Lei Browser API",
    description="Browser automation and management API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件服务
static_path = Path(__file__).parent.parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# 根路由 - 重定向到API文档
@app.get("/")
async def root():
    return RedirectResponse(url="/docs")

# 路由配置
app.include_router(api_router, prefix="/api/v1")

# 健康检查
@app.get("/health")
async def health_check():
    """API 健康检查"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "browser_manager": browser_manager is not None
    }

# 错误处理
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "detail": "Not Found",
        "path": request.url.path
    }

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {
        "detail": "Internal Server Error",
        "message": str(exc)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
