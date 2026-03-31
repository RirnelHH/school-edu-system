#!/bin/bash
# Docker 查看日志

SERVICE=${1:-"all"}

cd "$(dirname "$0")"

if [ "$SERVICE" = "all" ]; then
    echo "📝 显示所有服务日志 (Ctrl+C 退出)..."
    docker compose logs -f
else
    echo "📝 显示 $SERVICE 日志 (Ctrl+C 退出)..."
    docker compose logs -f $SERVICE
fi
