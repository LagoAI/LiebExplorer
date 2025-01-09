# File: deploy/install.sh
#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    log_error "请使用root权限运行此脚本"
    exit 1
fi

# 设置工作目录
WORK_DIR="/opt/chrome-control"
APP_USER="chrome-control"
APP_GROUP="chrome-control"

# 创建应用目录
setup_directories() {
    log_info "创建应用目录..."
    mkdir -p $WORK_DIR
    mkdir -p $WORK_DIR/logs
    mkdir -p $WORK_DIR/chrome_profiles
    mkdir -p $WORK_DIR/frontend/dist
}

# 创建应用用户
create_user() {
    log_info "创建应用用户..."
    if id "$APP_USER" &>/dev/null; then
        log_warn "用户 $APP_USER 已存在"
    else
        useradd -r -s /bin/false $APP_USER
        usermod -d $WORK_DIR $APP_USER
    fi
}

# 安装系统依赖
install_system_dependencies() {
    log_info "更新系统包..."
    apt-get update
    apt-get upgrade -y

    log_info "安装系统依赖..."
    apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        nodejs \
        npm \
        nginx \
        chromium-browser \
        chromium-chromedriver \
        xvfb \
        supervisor

    # 安装最新版Node.js
    log_info "安装最新版Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
}

# 创建Python虚拟环境并安装依赖
setup_python_env() {
    log_info "设置Python虚拟环境..."
    python3 -m venv $WORK_DIR/venv
    source $WORK_DIR/venv/bin/activate

    log_info "安装Python依赖..."
    pip install --upgrade pip
    pip install -r $WORK_DIR/requirements.txt
}

# 安装和构建前端
setup_frontend() {
    log_info "设置前端环境..."
    cd $WORK_DIR/frontend
    npm install
    npm run build

    log_info "配置Nginx..."
    cat > /etc/nginx/sites-available/chrome-control <<EOF
server {
    listen 80;
    server_name _;

    root $WORK_DIR/frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/chrome-control /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl restart nginx
}

# 配置Supervisor
setup_supervisor() {
    log_info "配置Supervisor..."
    cat > /etc/supervisor/conf.d/chrome-control.conf <<EOF
[program:chrome-control]
directory=$WORK_DIR
command=$WORK_DIR/venv/bin/python -m chrome_control.main
user=$APP_USER
autostart=true
autorestart=true
stderr_logfile=$WORK_DIR/logs/supervisor-err.log
stdout_logfile=$WORK_DIR/logs/supervisor-out.log
environment=DISPLAY=":1",PYTHONPATH="$WORK_DIR"

[program:xvfb]
command=/usr/bin/Xvfb :1 -screen 0 1920x1080x24
user=$APP_USER
autostart=true
autorestart=true
stderr_logfile=$WORK_DIR/logs/xvfb-err.log
stdout_logfile=$WORK_DIR/logs/xvfb-out.log
EOF

    supervisorctl reread
    supervisorctl update
}

# 设置服务开机自启
setup_autostart() {
    log_info "配置服务自启..."
    systemctl enable supervisor
    systemctl enable nginx
}

# 设置文件权限
setup_permissions() {
    log_info "设置文件权限..."
    chown -R $APP_USER:$APP_GROUP $WORK_DIR
    chmod -R 755 $WORK_DIR
}

# 安装完成后的检查
check_installation() {
    log_info "检查安装状态..."
    
    # 检查Python环境
    if [ -f "$WORK_DIR/venv/bin/python" ]; then
        log_info "Python虚拟环境: OK"
    else
        log_error "Python虚拟环境安装失败"
    fi

    # 检查前端构建
    if [ -f "$WORK_DIR/frontend/dist/index.html" ]; then
        log_info "前端构建: OK"
    else
        log_error "前端构建失败"
    fi

    # 检查Nginx配置
    if nginx -t 2>/dev/null; then
        log_info "Nginx配置: OK"
    else
        log_error "Nginx配置错误"
    fi

    # 检查服务状态
    if supervisorctl status | grep -q "chrome-control"; then
        log_info "Supervisor配置: OK"
    else
        log_error "Supervisor配置错误"
    fi
}

# 主函数
main() {
    log_info "开始安装 Chrome多实例控制系统..."

    setup_directories
    create_user
    install_system_dependencies
    setup_python_env
    setup_frontend
    setup_supervisor
    setup_autostart
    setup_permissions
    check_installation

    log_info "安装完成!"
    log_info "请访问 http://your-server-ip 来使用系统"
}

# 执行主函数
main

# File: deploy/uninstall.sh
#!/bin/bash

# 卸载脚本
WORK_DIR="/opt/chrome-control"
APP_USER="chrome-control"

echo "开始卸载 Chrome多实例控制系统..."

# 停止服务
supervisorctl stop chrome-control xvfb
systemctl stop nginx

# 删除配置文件
rm -f /etc/supervisor/conf.d/chrome-control.conf
rm -f /etc/nginx/sites-enabled/chrome-control
rm -f /etc/nginx/sites-available/chrome-control

# 删除应用目录
rm -rf $WORK_DIR

# 删除用户
userdel -r $APP_USER

echo "卸载完成!"

# File: requirements.txt
fastapi==0.103.2
uvicorn==0.23.2
selenium==4.12.0
webdriver-manager==4.0.0
python-dotenv==1.0.0
aiofiles==23.2.1
psutil==5.9.5
websockets==11.0.3
python-multipart==0.0.6
aiohttp==3.8.5

# File: .env.example
# 应用配置
APP_PORT=8000
APP_HOST=0.0.0.0
DEBUG=false

# Chrome配置
MAX_INSTANCES=10
DEFAULT_DISPLAY=:1
CHROME_PROFILES_DIR=/opt/chrome-control/chrome_profiles

# 系统配置
LOG_LEVEL=INFO
LOG_FILE=/opt/chrome-control/logs/app.log