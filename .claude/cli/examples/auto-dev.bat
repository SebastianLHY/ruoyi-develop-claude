@echo off
REM ============================================================
REM 自动化开发流程脚本 - Windows版本
REM 用途: 自动执行完整的开发流程
REM 使用方法: auto-dev.bat [模块名称]
REM ============================================================

setlocal enabledelayedexpansion

REM 获取CLI工具路径
set "CLI_DIR=%~dp0.."
set "JDC=%CLI_DIR%\jdc.bat"

REM 获取模块名称参数
set "MODULE_NAME=%~1"
if "%MODULE_NAME%"=="" (
    set "MODULE_NAME=默认模块"
)

echo ============================================================
echo 自动化开发流程
echo 模块名称: %MODULE_NAME%
echo ============================================================
echo.

REM 步骤1: 需求澄清与分析
echo [步骤 1/11] 需求澄清与分析...
call "%JDC%" step1 "%MODULE_NAME%"
if %errorlevel% neq 0 (
    echo 错误: 步骤1执行失败
    goto :error
)
echo.

REM 步骤2: 技术设计与模块规划
echo [步骤 2/11] 技术设计与模块规划...
call "%JDC%" step2
if %errorlevel% neq 0 (
    echo 错误: 步骤2执行失败
    goto :error
)
echo.

REM 步骤3: Git初始化
echo [步骤 3/11] Git初始化...
call "%JDC%" step3
if %errorlevel% neq 0 (
    echo 错误: 步骤3执行失败
    goto :error
)
echo.

REM 步骤4: 文档初始化
echo [步骤 4/11] 文档初始化...
call "%JDC%" step4
if %errorlevel% neq 0 (
    echo 错误: 步骤4执行失败
    goto :error
)
echo.

REM 步骤5: 数据库设计
echo [步骤 5/11] 数据库设计...
call "%JDC%" step5
if %errorlevel% neq 0 (
    echo 错误: 步骤5执行失败
    goto :error
)
echo.

REM 步骤5.5: 代码生成方式选择
echo [步骤 5.5/11] 代码生成方式选择...
call "%JDC%" step5.5
if %errorlevel% neq 0 (
    echo 错误: 步骤5.5执行失败
    goto :error
)
echo.

REM 步骤6: 后端开发
echo [步骤 6/11] 后端开发...
call "%JDC%" step6
if %errorlevel% neq 0 (
    echo 错误: 步骤6执行失败
    goto :error
)
echo.

REM 步骤7: 前端开发
echo [步骤 7/11] 前端开发...
call "%JDC%" step7
if %errorlevel% neq 0 (
    echo 错误: 步骤7执行失败
    goto :error
)
echo.

REM 步骤8: 测试验证
echo [步骤 8/11] 测试验证...
call "%JDC%" step8
if %errorlevel% neq 0 (
    echo 错误: 步骤8执行失败
    goto :error
)
echo.

REM 步骤9: 代码质量检查
echo [步骤 9/11] 代码质量检查...
call "%JDC%" step9
if %errorlevel% neq 0 (
    echo 错误: 步骤9执行失败
    goto :error
)
echo.

REM 步骤10: 文档更新
echo [步骤 10/11] 文档更新...
call "%JDC%" step10
if %errorlevel% neq 0 (
    echo 错误: 步骤10执行失败
    goto :error
)
echo.

REM 步骤11: Git提交与合并
echo [步骤 11/11] Git提交与合并...
call "%JDC%" step11
if %errorlevel% neq 0 (
    echo 错误: 步骤11执行失败
    goto :error
)
echo.

echo ============================================================
echo 开发流程完成！
echo ============================================================
goto :end

:error
echo ============================================================
echo 开发流程中断！
echo ============================================================
exit /b 1

:end
endlocal
