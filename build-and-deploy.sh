#!/bin/bash

# 构建并部署到群晖 Docker
# 使用方法: ./build-and-deploy.sh [tag]

TAG=${1:-latest}
IMAGE_NAME="parenting-app"
CONTAINER_NAME="parenting-app"

echo "🚀 开始构建 Docker 镜像..."
docker build -t ${IMAGE_NAME}:${TAG} .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi

echo "✅ 镜像构建成功: ${IMAGE_NAME}:${TAG}"

# 检查容器是否已存在
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "🛑 停止并删除旧容器..."
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
fi

# 确保数据目录存在
mkdir -p data

# 启动新容器
echo "🟢 启动新容器..."
docker run -d \
    --name ${CONTAINER_NAME} \
    --restart unless-stopped \
    -p 3000:3000 \
    -v $(pwd)/data:/app/data \
    -v $(pwd)/kids_learning.db:/app/kids_learning.db \
    -e NODE_ENV=production \
    -e PORT=3000 \
    ${IMAGE_NAME}:${TAG}

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🌐 访问地址: http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
    echo "查看日志: docker logs -f ${CONTAINER_NAME}"
else
    echo "❌ 部署失败"
    exit 1
fi
