#!/bin/bash
# 后端部署脚本 - 拉取代码、编译、重启

set -e  # 遇到错误就退出

cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

echo "=========================================="
echo "🚀 开始部署后端服务"
echo "=========================================="

# 1. 停止服务
echo ""
echo "📌 步骤1: 停止现有服务..."
./stop.sh

# 2. 拉取最新代码
echo ""
echo "📌 步骤2: 拉取最新代码..."
if [ -d ".git" ]; then
    git pull origin main
else
    echo "⚠️  非 git 项目，跳过拉取"
fi

# 3. 安装依赖
echo ""
echo "📌 步骤3: 安装依赖..."
npm install

# 4. 运行数据库迁移
echo ""
echo "📌 步骤4: 运行数据库迁移..."
npm run db:push

# 5. 编译
echo ""
echo "📌 步骤5: 编译 TypeScript..."
npm run build

# 6. 运行测试
echo ""
echo "📌 步骤6: 运行测试..."
if npm run test 2>&1 | tee /tmp/test_result.txt | grep -q "Test Suites:.*failed.*0"; then
    echo "✅ 所有测试通过"
else
    echo "⚠️  有测试失败，继续部署..."
    tail -20 /tmp/test_result.txt
fi

# 7. 启动服务
echo ""
echo "📌 步骤7: 启动服务..."
./start.sh

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
