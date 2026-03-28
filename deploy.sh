#!/bin/bash
# Parenting 项目部署脚本
# 用法: ./deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 开始部署 Parenting..."

# 检测 Docker 命令
DOCKER_CMD=""
DOCKER_COMPOSE_CMD=""

# 检查 docker compose (新语法) 还是 docker-compose (旧语法)
if docker compose version &>/dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif docker-compose version &>/dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif /usr/local/bin/docker compose version &>/dev/null; then
    DOCKER_COMPOSE_CMD="/usr/local/bin/docker compose"
elif /usr/local/bin/docker-compose version &>/dev/null; then
    DOCKER_COMPOSE_CMD="/usr/local/bin/docker-compose"
else
    echo "❌ 未找到 docker compose 命令"
    exit 1
fi

# 检查是否需要 sudo
SUDO_PREFIX=""
if ! docker ps &>/dev/null && ! $DOCKER_COMPOSE_CMD ps &>/dev/null; then
    # 检查 sudo 是否可用且不需要密码（或使用 NOPASSWD）
    if sudo -n docker ps &>/dev/null 2>&1; then
        SUDO_PREFIX="sudo"
        echo "⚠️  检测到需要 sudo 权限运行 Docker"
    elif sudo docker ps &>/dev/null 2>&1; then
        SUDO_PREFIX="sudo"
        echo "⚠️  检测到需要 sudo 权限运行 Docker"
    fi
fi

# 构建完整命令
COMPOSE_CMD="$SUDO_PREFIX $DOCKER_COMPOSE_CMD"

# 检查是否有本地冲突
echo "📥 拉取最新代码..."
# 设置 Git 缓冲区和重试机制以处理 SSL 错误
export GIT_HTTP_MAX_REQUEST_BUFFER=100M

# 尝试拉取，最多重试3次
for i in 1 2 3; do
    if git pull; then
        echo "✅ 代码拉取成功"
        break
    else
        echo "⚠️ 第 $i 次拉取失败..."
        if [ $i -eq 3 ]; then
            echo "❌ 多次拉取失败，请检查网络或手动执行 git pull"
            exit 1
        fi
        echo "⏳ 3秒后重试..."
        sleep 3
    fi
done

# 停止并删除旧容器
echo "🛑 停止旧容器..."
$COMPOSE_CMD down || true

# 重新构建并启动
echo "🏗️  重新构建并启动..."
$COMPOSE_CMD up -d --build

# 等待服务启动
sleep 3

# 检查状态
if $SUDO_PREFIX docker ps | grep -q "parenting-app"; then
    echo "✅ Parenting 部署成功!"
    IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    echo "📍 直接访问: http://$IP:3000"
    echo "📍 通过 Portal 访问: http://$IP:8080/portal-home/app/parenting"
else
    echo "❌ Parenting 部署失败，请检查日志:"
    $COMPOSE_CMD logs --tail=50
    exit 1
fi
