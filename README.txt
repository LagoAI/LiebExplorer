# Chrome多实例控制系统

一个基于FastAPI和React的Chrome多实例管理系统，支持多实例控制、状态管理、日志查看等功能。

## 系统要求

- Ubuntu 22.04 LTS
- Python 3.8+
- Node.js 18+
- Chrome/Chromium

## 快速开始

1. 克隆仓库：
```bash
git clone https://github.com/your-username/chrome-control.git
cd chrome-control
```

2. 安装部署：
```bash
# 赋予安装脚本执行权限
chmod +x deploy/install.sh

# 使用root权限运行安装脚本
sudo ./deploy/install.sh
```

3. 检查服务状态：
```bash
# 检查后端服务状态
sudo supervisorctl status

# 检查Nginx状态
sudo systemctl status nginx
```

4. 访问系统：
打开浏览器访问 `http://your-server-ip`

## 目录结构

```
chrome-control/
├── chrome_control/           # 后端Python代码
│   ├── browser/             # 浏览器控制相关
│   ├── ui/                  # UI相关
│   └── utils/              # 工具函数
├── frontend/                # 前端React代码
├── deploy/                  # 部署脚本
├── requirements.txt         # Python依赖
└── README.md               # 项目文档
```

## 配置说明

1. 环境配置：
复制 `.env.example` 到 `.env` 并根据需要修改配置：
```bash
cp .env.example .env
```

2. Nginx配置：
配置文件位置：`/etc/nginx/sites-available/chrome-control`

3. Supervisor配置：
配置文件位置：`/etc/supervisor/conf.d/chrome-control.conf`

## 常用命令

1. 服务控制：
```bash
# 启动服务
sudo supervisorctl start chrome-control

# 停止服务
sudo supervisorctl stop chrome-control

# 重启服务
sudo supervisorctl restart chrome-control

# 查看日志
sudo supervisorctl tail -f chrome-control
```

2. 查看日志：
```bash
# 应用日志
tail -f /opt/chrome-control/logs/app.log

# Supervisor日志
tail -f /opt/chrome-control/logs/supervisor-*.log

# Nginx访问日志
tail -f /var/log/nginx/access.log
```

## 卸载

如需卸载系统：
```bash
sudo ./deploy/uninstall.sh
```

## 故障排除

1. 服务无法启动
- 检查日志：`tail -f /opt/chrome-control/logs/supervisor-err.log`
- 确认端口是否被占用：`netstat -tulpn | grep 8000`

2. 无法访问Web界面
- 检查Nginx状态：`systemctl status nginx`
- 检查Nginx错误日志：`tail -f /var/log/nginx/error.log`

3. Chrome实例启动失败
- 检查Xvfb状态：`supervisorctl status xvfb`
- 确认Chrome和ChromeDriver版本匹配

## 维护与更新

1. 更新代码：
```bash
cd /opt/chrome-control
git pull
sudo supervisorctl restart chrome-control
```

2. 更新依赖：
```bash
source /opt/chrome-control/venv/bin/activate
pip install -r requirements.txt
sudo supervisorctl restart chrome-control
```

## 安全建议

1. 使用SSL证书保护Web界面
2. 设置访问IP白名单
3. 更改默认端口
4. 定期更新系统和依赖

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License