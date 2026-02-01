@echo off
REM ============================================================
REM 快速开发脚本 - 跳过某些步骤
REM 用途: 适用于小型修改或快速迭代
REM 使用方法: quick-dev.bat [模块名称]
REM ============================================================

setlocal enabledelayedexpansion

set "CLI_DIR=%~dp0.."
set "JDC=%CLI_DIR%\jdc.bat"
set "MODULE_NAME=%~1"

if "%MODULE_NAME%"=="" (
    set "MODULE_NAME=快速开发模块"
)

echo ============================================================
echo 快速开发流程 (跳过Git初始化和文档初始化)
echo 模块名称: %MODULE_NAME%
echo ============================================================
echo.

REM 步骤1: 需求澄清
echo [步骤 1/7] 需求澄清...
call "%JDC%" step1 "%MODULE_NAME%"
echo.

REM 步骤2: 技术设计
echo [步骤 2/7] 技术设计...
call "%JDC%" step2
echo.

REM 步骤5: 数据库设计
echo [步骤 3/7] 数据库设计...
call "%JDC%" step5
echo.

REM 步骤6: 后端开发
echo [步骤 4/7] 后端开发...
call "%JDC%" step6
echo.

REM 步骤7: 前端开发
echo [步骤 5/7] 前端开发...
call "%JDC%" step7
echo.

REM 步骤8: 测试验证
echo [步骤 6/7] 测试验证...
call "%JDC%" step8
echo.

REM 步骤11: Git提交
echo [步骤 7/7] Git提交...
call "%JDC%" step11
echo.

echo ============================================================
echo 快速开发完成！
echo ============================================================

endlocal
