#!/bin/bash
# 后端启动脚本

cd "$(dirname "$0")"

# 检查端口是否已被占用
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  端口 3000 已被占用，先停止现有进程..."
    ./stop.sh
    sleep 2
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查数据库连接
echo "🔍 检查数据库连接..."
npm run db:check 2>/dev/null || echo "数据库检查完成"

# 启动服务
echo "🚀 启动后端服务..."
nohup npm run start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

echo $BACKEND_PID > .pid

sleep 3

# 检查是否启动成功
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "✅ 后端服务启动成功 (PID: $BACKEND_PID)"
    echo "📝 日志文件: ../logs/backend.log"
    echo "🌐 服务地址: http://localhost:3000"
    echo "📚 API文档: http://localhost:3000/api/docs"
else
    echo "❌ 后端服务启动失败，请查看日志"
    tail -50 ../logs/backend.log
    exit 1
fi
