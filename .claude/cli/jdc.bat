@echo off
REM Java Development Claude CLI - Windows快捷脚本
REM 使用方法: jdc <command> [options] [args]

setlocal enabledelayedexpansion

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    exit /b 1
)

REM 执行CLI工具
node "%SCRIPT_DIR%cli.js" %*

endlocal
