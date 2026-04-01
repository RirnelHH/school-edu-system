#!/bin/bash
# 停止前后端服务

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🛑 停止教务管理系统..."

# 停止前端
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    pkill -f "vite.*8080" && echo "✅ 前端已停止" || echo "⚠️ 前端停止失败"
fi

# 停止后端
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    pkill -f "ts-node.*src/main.ts" && echo "✅ 后端已停止" || echo "⚠️ 后端停止失败"
fi

echo ""
echo "📊 端口占用:"
netstat -tlnp 2>/dev/null | grep -E "3000|8080" || ss -tlnp | grep -E "3000|8080" || echo "  无"
