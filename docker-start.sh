#!/bin/bash
# Docker 启动所有服务

cd "$(dirname "$0")"

echo "🚀 启动 Docker 服务..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker Desktop"
    exit 1
fi

# 启动所有服务
docker compose up -d

# 等待数据库就绪
echo "⏳ 等待数据库启动..."
sleep 5

# 检查服务状态
echo ""
echo "📊 服务状态："
docker compose ps

echo ""
echo "🌐 访问地址："
echo "   前端: http://localhost:8080"
echo "   后端: http://localhost:3000"
echo "   数据库: localhost:3306"
