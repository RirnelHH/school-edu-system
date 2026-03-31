#!/bin/bash
# Docker 重启所有服务

cd "$(dirname "$0")"

echo "🔄 重启 Docker 服务..."
docker compose restart

echo ""
echo "📊 服务状态："
docker compose ps
