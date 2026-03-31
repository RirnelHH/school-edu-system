#!/bin/bash
# 后端停止脚本

cd "$(dirname "$0")"

echo "🛑 停止后端服务..."

# 如果有 PID 文件，读取并杀掉进程
if [ -f .pid ]; then
    PID=$(cat .pid)
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        echo "✅ 进程 $PID 已停止"
    else
        echo "⚠️  进程 $PID 不存在，可能已经停止"
    fi
    rm .pid
else
    echo "📋 未找到 PID 文件，尝试通过端口查找..."
fi

# 通过端口杀掉进程
if lsof -i :3000 > /dev/null 2>&1; then
    PIDS=$(lsof -t -i :3000)
    for pid in $PIDS; do
        kill $pid 2>/dev/null && echo "✅ 进程 $pid 已停止"
    done
else
    echo "ℹ️  端口 3000 未被占用"
fi

# 等待一下让进程完全退出
sleep 1

# 确认已停止
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  端口 3000 仍有进程占用，强制终止..."
    lsof -t -i :3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ 停止完成"
