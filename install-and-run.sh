#!/bin/bash

# 切换到项目目录
cd "$(dirname "$0")"

echo "📦 开始安装依赖..."
npm install

# 检查安装是否成功
if [ -d "node_modules" ]; then
    echo "✅ 依赖安装成功！"
    echo "🚀 启动开发服务器..."
    npm run dev
else
    echo "❌ 依赖安装失败，请检查错误信息"
    exit 1
fi








