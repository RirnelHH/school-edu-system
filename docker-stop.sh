#!/bin/bash
# Docker 停止所有服务

cd "$(dirname "$0")"

echo "🛑 停止 Docker 服务..."
docker compose stop

echo "✅ 已停止（数据保留在 volumes 中）"
echo "   下次启动: ./docker-start.sh"
