#!/bin/bash
# 前端后端一键启动脚本

set -e

# 获取脚本所在目录（支持软链接）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
LOG_DIR="$PROJECT_DIR/logs"

mkdir -p "$LOG_DIR"

echo "🚀 启动教务管理系统..."

# 1. 启动 MySQL
echo "📦 启动 MySQL..."
if ! service mysql status > /dev/null 2>&1; then
    service mysql start
    echo "✅ MySQL 已启动"
else
    echo "✅ MySQL 已运行"
fi

# 2. 启动后端
echo "🔧 启动后端 (port 3000)..."
cd "$BACKEND_DIR"
if ! curl -s http://localhost:3000/api/v1/schools > /dev/null 2>&1; then
    nohup npm run start:dev > "$LOG_DIR/backend.log" 2>&1 &
    echo "✅ 后端已启动 (PID: $!)"
    echo "   日志: $LOG_DIR/backend.log"
else
    echo "✅ 后端已运行"
fi

# 3. 启动前端
echo "🎨 启动前端 (port 8080)..."
cd "$FRONTEND_DIR"
if ! curl -s http://localhost:8080 > /dev/null 2>&1; then
    nohup npm run dev -- --port 8080 > "$LOG_DIR/frontend.log" 2>&1 &
    echo "✅ 前端已启动 (PID: $!)"
    echo "   日志: $LOG_DIR/frontend.log"
else
    echo "✅ 前端已运行"
fi

# 4. 等待服务就绪
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "📊 服务状态:"
curl -s http://localhost:3000/api/v1/schools > /dev/null 2>&1 && echo "  ✅ 后端 API (3000)" || echo "  ❌ 后端 API (3000)"
curl -s http://localhost:8080 > /dev/null 2>&1 && echo "  ✅ 前端 (8080)" || echo "  ❌ 前端 (8080)"

echo ""
echo "🌐 访问地址:"
echo "   前端: http://localhost:8080"
echo "   后端: http://localhost:3000"
echo ""
echo "📝 查看日志:"
echo "   后端: tail -f $LOG_DIR/backend.log"
echo "   前端: tail -f $LOG_DIR/frontend.log"
