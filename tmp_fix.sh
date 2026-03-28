#!/bin/bash
# 临时修复 SSL 问题的部署脚本

echo "🚀 开始部署 Parenting..."

# 检查当前远程仓库地址
echo "📋 当前远程仓库地址:"
git remote -v

# 尝试将 HTTPS 改为 SSH（如果需要）
CURRENT_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$CURRENT_URL" == https://github.com/* ]]; then
    REPO_PATH=${CURRENT_URL#https://github.com/}
    SSH_URL="git@github.com:${REPO_PATH}"
    echo "🔧 切换到 SSH 地址: $SSH_URL"
    git remote set-url origin "$SSH_URL"
fi

echo "📥 拉取最新代码..."
# 添加重试机制和 Git 缓冲设置
export GIT_SSL_NO_VERIFY=0
export GIT_HTTP_MAX_REQUEST_BUFFER=100M

# 尝试拉取，最多重试3次
for i in 1 2 3; do
    if git pull; then
        echo "✅ 代码拉取成功"
        break
    else
        echo "⚠️ 第 $i 次拉取失败，等待重试..."
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
