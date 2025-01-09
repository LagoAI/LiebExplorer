import uvicorn
import click
from pathlib import Path
from app.utils.logger import setup_logging

@click.command()
@click.option('--host', default="127.0.0.1", help="Bind socket to this host.")
@click.option('--port', default=8000, help="Bind socket to this port.")
@click.option('--reload', is_flag=True, help="Enable auto-reload.")
@click.option('--workers', default=1, help="Number of worker processes.")
@click.option('--log-file', type=click.Path(), help="Log file path.")
def main(host: str, port: int, reload: bool, workers: int, log_file: str):
    """启动 Lei Browser API 服务"""
    # 设置日志
    if log_file:
        setup_logging(Path(log_file))
    else:
        setup_logging()

    # 启动服务器
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        workers=workers,
        log_level="info"
    )

if __name__ == "__main__":
    main()
