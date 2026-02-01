#!/bin/bash
# Java Development Claude CLI - Linux/Mac快捷脚本
# 使用方法: jdc <command> [options] [args]

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 执行CLI工具
node "$SCRIPT_DIR/cli.js" "$@"
