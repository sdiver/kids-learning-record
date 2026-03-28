#!/bin/bash
# Parenting 项目部署脚本
# 用法: ./deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 开始部署 Parenting..."

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
docker-compose down

# 重新构建并启动
echo "🏗️  重新构建并启动..."
docker-compose up -d --build

# 等待服务启动
sleep 3

# 检查状态
if docker ps | grep -q "parenting-app"; then
    echo "✅ Parenting 部署成功!"
    echo "📍 直接访问: http://$(hostname -I | awk '{print $1}'):3000"
    echo "📍 通过 Portal 访问: http://$(hostname -I | awk '{print $1}'):8080/portal-home/app/parenting"
else
    echo "❌ Parenting 部署失败，请检查日志:"
    docker-compose logs --tail=50
    exit 1
fi
