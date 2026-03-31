#!/bin/bash
# 后端重启脚本

cd "$(dirname "$0")"

echo "🔄 重启后端服务..."

# 先停止
./stop.sh

# 等待一下
sleep 2

# 再启动
./start.sh
