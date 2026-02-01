@echo off
REM ============================================================
REM 智能体工作流脚本
REM 用途: 使用智能体自动化开发流程
REM 使用方法: agent-workflow.bat [模块名称]
REM ============================================================

setlocal enabledelayedexpansion

set "CLI_DIR=%~dp0.."
set "JDC=%CLI_DIR%\jdc.bat"
set "MODULE_NAME=%~1"

if "%MODULE_NAME%"=="" (
    set "MODULE_NAME=智能体开发模块"
)

echo ============================================================
echo 智能体工作流
echo 模块名称: %MODULE_NAME%
echo ============================================================
echo.

REM 需求分析
echo [阶段 1/5] 需求分析...
call "%JDC%" agent:requirements-analyst "分析%MODULE_NAME%的需求"
echo.

REM 代码生成
echo [阶段 2/5] 代码生成...
call "%JDC%" agent:code-generator "生成%MODULE_NAME%的后端代码"
echo.

REM UI生成
echo [阶段 3/5] UI生成...
call "%JDC%" agent:ui-generator "生成%MODULE_NAME%的前端页面"
echo.

REM 测试
echo [阶段 4/5] 测试...
call "%JDC%" agent:test-engineer "为%MODULE_NAME%编写测试用例"
echo.

REM 质量检查
echo [阶段 5/5] 质量检查...
call "%JDC%" agent:quality-inspector "检查%MODULE_NAME%的代码质量"
echo.

echo ============================================================
echo 智能体工作流完成！
echo ============================================================

endlocal
