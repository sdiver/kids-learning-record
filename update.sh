#!/bin/bash

# 自动更新脚本 - 在群晖上运行
# 此脚本会拉取最新代码并重新构建镜像

cd "$(dirname "$0")"

echo "🔄 开始更新 parenting-app..."

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin $(git branch --show-current)

if [ $? -ne 0 ]; then
    echo "❌ 代码拉取失败，请检查网络或 Git 配置"
    exit 1
fi

# 2. 重新构建镜像
echo "🔨 重新构建 Docker 镜像..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi

# 3. 重启容器
echo "🔄 重启容器..."
docker-compose up -d

# 4. 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f

echo "✅ 更新完成！"
echo ""
echo "查看日志: docker-compose logs -f parenting"
echo "访问地址: http://$(hostname -I | awk '{print $1}'):3000"
