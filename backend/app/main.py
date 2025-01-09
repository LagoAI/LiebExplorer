from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
from pathlib import Path

from .core.browser_manager_instance import get_browser_manager
from .api import api_router
from .config import Config

# 初始化配置
Config.initialize()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    应用生命周期管理
    在应用启动时初始化浏览器管理器，在应用关闭时清理资源
    """
    browser_manager = get_browser_manager()
    try:
        yield
    finally:
        if browser_manager:
            browser_manager.cleanup()

# FastAPI 应用实例
app = FastAPI(
    title="Lei Browser API",
    description="Browser automation and management API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# 允许的源
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

# CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type", 
        "Authorization", 
        "Accept", 
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=["*"],
    max_age=3600,
)

# 挂载静态文件服务
static_path = Path(__file__).parent.parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# 根路由 - 重定向到API文档
@app.get("/")
async def root():
    return RedirectResponse(url="/docs")

# 注册API路由
app.include_router(api_router, prefix="/api/v1")

# 健康检查端点
@app.get("/health")
async def health_check():
    """API 健康检查"""
    browser_manager = get_browser_manager()
    return {
        "status": "healthy",
        "version": "1.0.0",
        "browser_manager": browser_manager is not None
    }

# 全局错误处理
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

# 预检请求处理
@app.options("/{path:path}")
async def options_handler(path: str):
    return {"detail": "OK"}

# 开发服务器配置
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=True,  # 开发模式下启用热重载
        log_level="info"
    )
