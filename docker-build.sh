#!/bin/bash
# Docker 构建脚本

cd "$(dirname "$0")"

echo "=========================================="
echo "🐳 构建 Docker 镜像"
echo "=========================================="

# 构建所有镜像
echo "📦 构建后端镜像..."
docker compose build backend

echo "📦 构建前端..."
# 前端需要先构建
cd frontend && npm run build && cd ..

echo "📦 构建前端镜像..."
docker compose build frontend

echo ""
echo "✅ 构建完成！"
docker compose images
