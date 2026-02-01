# CLI示例脚本

本目录包含各种CLI工具的示例脚本，用于演示如何使用CLI工具进行自动化开发。

## 📋 脚本列表

### 1. auto-dev.bat / auto-dev.sh
**完整自动化开发流程**

执行完整的11个步骤开发流程。

**使用方法:**
```bash
# Windows
auto-dev.bat "用户管理模块"

# Linux/Mac
chmod +x auto-dev.sh
./auto-dev.sh "用户管理模块"
```

**适用场景:**
- 新模块开发
- 完整功能开发
- 需要完整文档和测试的项目

### 2. quick-dev.bat / quick-dev.sh
**快速开发流程**

跳过Git初始化和文档初始化，适合快速迭代。

**使用方法:**
```bash
# Windows
quick-dev.bat "快速修复"

# Linux/Mac
chmod +x quick-dev.sh
./quick-dev.sh "快速修复"
```

**适用场景:**
- 小型修改
- Bug修复
- 快速原型开发
- 已有项目的增量开发

### 3. agent-workflow.bat / agent-workflow.sh
**智能体工作流**

使用智能体自动化开发流程。

**使用方法:**
```bash
# Windows
agent-workflow.bat "订单管理模块"

# Linux/Mac
chmod +x agent-workflow.sh
./agent-workflow.sh "订单管理模块"
```

**适用场景:**
- 需要AI辅助的复杂模块
- 代码生成场景
- 自动化测试生成
- 代码质量检查

## 🔧 自定义脚本

你可以基于这些示例创建自己的脚本：

### 示例1: 仅后端开发

```batch
@echo off
set "JDC=..\jdc.bat"

call "%JDC%" step1 "后端API开发"
call "%JDC%" step2
call "%JDC%" step5
call "%JDC%" step6
call "%JDC%" step8
call "%JDC%" step11
```

### 示例2: 仅前端开发

```batch
@echo off
set "JDC=..\jdc.bat"

call "%JDC%" step1 "前端页面开发"
call "%JDC%" step2
call "%JDC%" step7
call "%JDC%" step8
call "%JDC%" step11
```

### 示例3: 测试驱动开发

```batch
@echo off
set "JDC=..\jdc.bat"

call "%JDC%" step1 "TDD开发"
call "%JDC%" agent:test-engineer "先编写测试用例"
call "%JDC%" step6
call "%JDC%" step8
call "%JDC%" agent:quality-inspector "检查代码质量"
call "%JDC%" step11
```

## 💡 使用技巧

### 1. 错误处理

在脚本中添加错误处理：

```batch
call "%JDC%" step1
if %errorlevel% neq 0 (
    echo 步骤1失败，停止执行
    exit /b 1
)
```

### 2. 条件执行

根据条件执行不同步骤：

```batch
set /p SKIP_TESTS="是否跳过测试? (Y/N): "
if /i "%SKIP_TESTS%"=="Y" (
    echo 跳过测试步骤
) else (
    call "%JDC%" step8
)
```

### 3. 日志记录

记录执行日志：

```batch
set "LOG_FILE=dev_%date:~0,4%%date:~5,2%%date:~8,2%.log"
call "%JDC%" step1 >> "%LOG_FILE%" 2>&1
```

### 4. 并行执行

对于独立的任务，可以并行执行：

```bash
# Linux/Mac
./jdc.sh check &
./jdc.sh progress &
wait
```

## 📊 脚本对比

| 脚本 | 步骤数 | 执行时间 | 适用场景 |
|------|--------|----------|----------|
| auto-dev | 11 | 长 | 完整开发 |
| quick-dev | 7 | 中 | 快速迭代 |
| agent-workflow | 5 | 短 | AI辅助开发 |

## 🔍 故障排除

### 问题1: 脚本执行失败

**解决方案:**
1. 检查JDC路径是否正确
2. 确保CLI工具已正确安装
3. 使用 `--verbose` 选项查看详细信息

### 问题2: 权限问题 (Linux/Mac)

**解决方案:**
```bash
chmod +x *.sh
```

### 问题3: 中途中断

**解决方案:**
- 使用 `jdc progress` 查看当前进度
- 使用 `jdc next` 继续下一步
- 或从失败的步骤重新开始

## 📝 最佳实践

1. **模块化**: 将复杂流程拆分为多个小脚本
2. **参数化**: 使用命令行参数提高脚本灵活性
3. **错误处理**: 添加适当的错误处理和日志记录
4. **文档化**: 为自定义脚本添加清晰的注释
5. **版本控制**: 将脚本纳入版本控制系统

## 🎯 下一步

- 查看 [CLI README](../README.md) 了解更多命令
- 阅读 [开发流程文档](../../commands/dev.md) 了解详细步骤
- 创建自己的自定义脚本

---

如有问题或建议，请提交Issue或PR。
