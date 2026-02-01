# Java Development Claude CLI Tool

> **版本**: v1.0.0  
> **最后更新**: 2026-01-29

---

## 📋 目录

- [简介](#简介)
- [功能特性](#功能特性)
- [安装配置](#安装配置)
- [快速开始](#快速开始)
- [命令参考](#命令参考)
- [使用示例](#使用示例)
- [脚本化执行](#脚本化执行)
- [配置说明](#配置说明)
- [故障排除](#故障排除)

---

## 🎯 简介

Java Development Claude CLI Tool 是一个命令行工具，用于快速启动和自动化执行Java开发流程。它提供了简洁的命令行接口，支持脚本化执行，无需手动编写提示词。

### 核心优势

- ✅ **快速启动**: 一条命令启动完整开发流程
- ✅ **脚本化执行**: 支持批处理和自动化脚本
- ✅ **智能体集成**: 快速激活各类智能体
- ✅ **步骤化管理**: 精确控制每个开发步骤
- ✅ **跨平台支持**: Windows、Linux、Mac全平台支持
- ✅ **无历史文档**: 专注执行，不生成历史总结

---

## ⚡ 功能特性

### 1. 基础命令
- `start` - 启动开发流程
- `check` - 检查项目状态
- `progress` - 查看进度
- `next` - 执行下一步
- `reset` - 重置项目
- `init-docs` - 初始化文档
- `update-status` - 更新项目状态
- `update-todo` - 更新待办清单
- `dependency-check` - 检查步骤依赖

### 2. 步骤命令
- `step1` - 步骤1: 需求澄清与分析
- `step2` - 步骤2: 技术设计与模块规划
- `step3` - 步骤3: Git初始化
- `step4` - 步骤4: 文档初始化
- `step5` - 步骤5: 数据库设计
- `step5.5` - 步骤5.5: 代码生成方式选择
- `step6` - 步骤6: 后端开发
- `step7` - 步骤7: 前端开发
- `step8` - 步骤8: 测试验证
- `step9` - 步骤9: 代码质量检查
- `step10` - 步骤10: 文档更新
- `step11` - 步骤11: Git提交与合并

### 3. 智能体命令
- `agent:requirements-analyst` - 需求分析师
- `agent:code-generator` - 代码生成器
- `agent:ui-generator` - UI生成器
- `agent:test-engineer` - 测试工程师
- `agent:quality-inspector` - 质量检查员
- `agent:bug-detective` - Bug侦探
- `agent:code-reviewer` - 代码审查员
- `agent:git-workflow-manager` - Git工作流管理器
- `agent:project-manager` - 项目管理器
- `agent:deployment-assistant` - 部署助手
- `agent:release-manager` - 发布管理器

### 4. 执行选项
- `--dry-run` - 预览模式，不实际执行
- `--verbose` / `-v` - 详细输出模式
- `--help` / `-h` - 显示帮助信息

---

## 🚀 安装配置

### 前置要求

- Node.js >= 14.0.0
- Claude CLI 工具已安装并配置

### 安装步骤

#### 1. 检查Node.js版本

```bash
node --version
```

如果未安装，请访问 [nodejs.org](https://nodejs.org/) 下载安装。

#### 2. 配置快捷脚本

**Windows系统:**

```batch
# 将 jdc.bat 所在目录添加到系统PATH
# 或创建系统级别的快捷方式
cd d:\git_repository\java-development-claude\.claude\cli
```

**Linux/Mac系统:**

```bash
# 添加执行权限
chmod +x jdc.sh

# 创建符号链接到 /usr/local/bin (可选)
sudo ln -s /path/to/jdc.sh /usr/local/bin/jdc
```

#### 3. 验证安装

```bash
# Windows
jdc --help

# Linux/Mac
./jdc.sh --help

# 或直接使用Node.js
node cli.js --help
```

---

## 🎯 快速开始

### 第一次使用

```bash
# 1. 查看帮助信息
jdc --help

# 2. 查看快速开始指南
jdc quick-start

# 3. 启动开发流程
jdc start

# 4. 检查项目状态
jdc check
```

### 典型工作流

```bash
# 步骤1: 需求分析
jdc step1 "开发用户管理模块"

# 步骤2: 技术设计
jdc step2

# 步骤3: Git初始化
jdc step3

# 步骤4: 文档初始化
jdc step4

# 步骤5: 数据库设计
jdc step5

# 步骤6: 后端开发
jdc step6

# 步骤7: 前端开发
jdc step7

# 步骤8: 测试验证
jdc step8

# 步骤9: 质量检查
jdc step9

# 步骤10: 文档更新
jdc step10

# 步骤11: Git提交
jdc step11
```

---

## 📖 命令参考

### 基础命令详解

#### start - 启动开发流程

```bash
jdc start [模块名称]

# 示例
jdc start "用户管理模块"
jdc start --verbose
```

#### check - 检查项目状态

```bash
jdc check [检查项]

# 示例
jdc check
jdc check --verbose
```

#### progress - 查看进度

```bash
jdc progress

# 示例
jdc progress
jdc progress --verbose
```

#### next - 执行下一步

```bash
jdc next [额外信息]

# 示例
jdc next
jdc next "跳过某些检查"
```

#### dependency-check - 检查步骤依赖

```bash
jdc dependency-check [步骤号]

# 示例
jdc dependency-check
jdc dependency-check step6
```

### 步骤命令详解

```bash
# 基本语法
jdc step<N> [额外信息]

# 示例
jdc step1 "开发订单管理模块"
jdc step2 --verbose
jdc step5.5 "选择手动编写代码"
jdc step6 "实现订单CRUD接口"
```

### 智能体命令详解

```bash
# 基本语法
jdc agent:<name> [任务描述]

# 示例
jdc agent:code-generator "生成订单管理模块代码"
jdc agent:test-engineer "编写订单模块单元测试"
jdc agent:quality-inspector "检查代码质量"
```

### 执行选项

#### --dry-run (预览模式)

```bash
# 仅显示将要执行的命令，不实际执行
jdc start --dry-run
jdc step1 --dry-run "用户管理模块"
```

#### --verbose / -v (详细模式)

```bash
# 显示详细的执行信息和调试日志
jdc check --verbose
jdc step6 -v
```

---

## 💡 使用示例

### 示例1: 完整开发流程

```bash
# 启动新模块开发
jdc start "商品管理模块"

# 执行步骤1-11
jdc step1 "商品管理模块，包含CRUD和库存管理"
jdc step2
jdc step3
jdc step4
jdc step5
jdc step5.5 "使用代码生成器"
jdc step6
jdc step7
jdc step8
jdc step9
jdc step10
jdc step11

# 检查最终状态
jdc check
```

### 示例2: 使用智能体

```bash
# 需求分析
jdc agent:requirements-analyst "分析商品管理模块需求"

# 代码生成
jdc agent:code-generator "生成商品管理模块后端代码"

# UI生成
jdc agent:ui-generator "生成商品管理页面"

# 测试
jdc agent:test-engineer "编写商品模块测试用例"

# 质量检查
jdc agent:quality-inspector "检查商品模块代码质量"
```

### 示例3: 预览模式

```bash
# 预览将要执行的操作
jdc start --dry-run
jdc step6 --dry-run "后端开发"
jdc agent:code-generator --dry-run "生成代码"
```

### 示例4: 调试模式

```bash
# 详细输出调试信息
jdc check --verbose
jdc step8 --verbose
jdc agent:bug-detective --verbose "调试登录失败问题"
```

---

## 🔧 脚本化执行

### Batch脚本 (Windows)

创建 `auto-dev.bat`:

```batch
@echo off
echo 开始自动化开发流程...

REM 步骤1-4: 初始化
call jdc step1 "自动化开发模块"
call jdc step2
call jdc step3
call jdc step4

REM 步骤5: 数据库设计
call jdc step5

REM 步骤6-7: 代码开发
call jdc agent:code-generator "生成后端代码"
call jdc agent:ui-generator "生成前端页面"

REM 步骤8-9: 测试和质量检查
call jdc step8
call jdc step9

REM 步骤10-11: 文档和提交
call jdc step10
call jdc step11

echo 开发流程完成！
pause
```

### Shell脚本 (Linux/Mac)

创建 `auto-dev.sh`:

```bash
#!/bin/bash
echo "开始自动化开发流程..."

# 步骤1-4: 初始化
./jdc.sh step1 "自动化开发模块"
./jdc.sh step2
./jdc.sh step3
./jdc.sh step4

# 步骤5: 数据库设计
./jdc.sh step5

# 步骤6-7: 代码开发
./jdc.sh agent:code-generator "生成后端代码"
./jdc.sh agent:ui-generator "生成前端页面"

# 步骤8-9: 测试和质量检查
./jdc.sh step8
./jdc.sh step9

# 步骤10-11: 文档和提交
./jdc.sh step10
./jdc.sh step11

echo "开发流程完成！"
```

### PowerShell脚本

创建 `auto-dev.ps1`:

```powershell
Write-Host "开始自动化开发流程..." -ForegroundColor Green

# 步骤1-4: 初始化
& jdc step1 "自动化开发模块"
& jdc step2
& jdc step3
& jdc step4

# 步骤5: 数据库设计
& jdc step5

# 步骤6-7: 代码开发
& jdc agent:code-generator "生成后端代码"
& jdc agent:ui-generator "生成前端页面"

# 步骤8-9: 测试和质量检查
& jdc step8
& jdc step9

# 步骤10-11: 文档和提交
& jdc step10
& jdc step11

Write-Host "开发流程完成！" -ForegroundColor Green
```

### 条件执行脚本

创建 `smart-dev.sh`:

```bash
#!/bin/bash

# 检查上一步是否成功
check_status() {
    if [ $? -ne 0 ]; then
        echo "错误: 步骤失败，停止执行"
        exit 1
    fi
}

echo "开始智能开发流程..."

# 执行步骤并检查状态
./jdc.sh step1 "智能开发模块"
check_status

./jdc.sh step2
check_status

./jdc.sh step3
check_status

# 依赖检查
./jdc.sh dependency-check step6
if [ $? -eq 0 ]; then
    ./jdc.sh step6
    check_status
else
    echo "警告: 步骤6的依赖检查失败，跳过此步骤"
fi

echo "开发流程完成！"
```

---

## ⚙️ 配置说明

### CLI配置文件

编辑 `cli.js` 中的 `CONFIG` 对象:

```javascript
const CONFIG = {
  // 命令文件目录
  commandsDir: path.join(__dirname, '..', 'commands'),
  
  // 智能体文件目录
  agentsDir: path.join(__dirname, '..', 'agents'),
  
  // 项目根目录
  projectRoot: path.join(__dirname, '..', '..'),
  
  // Claude命令
  claudeCmd: 'claude',
  
  // 是否跳过权限检查
  skipPermissions: true
};
```

### 环境变量

可以通过环境变量覆盖默认配置:

```bash
# Windows
set JDC_CLAUDE_CMD=claude
set JDC_SKIP_PERMISSIONS=true

# Linux/Mac
export JDC_CLAUDE_CMD=claude
export JDC_SKIP_PERMISSIONS=true
```

### 自定义命令

在 `cli.js` 中添加自定义命令:

```javascript
const COMMANDS = {
  // ... 现有命令 ...
  
  'my-command': {
    file: 'my-command.md',
    description: '我的自定义命令',
    prompt: '请执行我的自定义命令'
  }
};
```

---

## 🔍 故障排除

### 常见问题

#### 1. 命令未找到

**问题**: `jdc: command not found`

**解决方案**:
```bash
# 检查Node.js是否安装
node --version

# 检查脚本权限 (Linux/Mac)
chmod +x jdc.sh

# 使用完整路径
node /path/to/cli.js <command>
```

#### 2. Claude命令执行失败

**问题**: `claude: command not found`

**解决方案**:
```bash
# 检查Claude CLI是否安装
claude --version

# 配置Claude命令路径
# 编辑 cli.js 中的 CONFIG.claudeCmd
```

#### 3. 权限问题

**问题**: `Permission denied`

**解决方案**:
```bash
# Windows: 以管理员身份运行
# Linux/Mac: 添加执行权限
chmod +x jdc.sh

# 或使用sudo
sudo ./jdc.sh <command>
```

#### 4. 文件未找到

**问题**: `命令文件不存在`

**解决方案**:
```bash
# 检查文件路径是否正确
ls .claude/commands/

# 检查CONFIG配置
# 确保 commandsDir 和 agentsDir 路径正确
```

### 调试技巧

#### 1. 使用详细模式

```bash
jdc <command> --verbose
```

#### 2. 使用预览模式

```bash
jdc <command> --dry-run
```

#### 3. 检查日志

```bash
# 查看Claude执行日志
# 日志位置取决于Claude CLI配置
```

#### 4. 手动执行

```bash
# 直接使用Node.js执行
node cli.js <command> --verbose

# 查看帮助信息
node cli.js --help
```

---

## 📊 性能优化

### 1. 批量执行

```bash
# 使用脚本批量执行多个命令
# 避免频繁启动Node.js进程
```

### 2. 缓存机制

```bash
# 缓存命令文件内容
# 减少文件读取次数
```

### 3. 并行执行

```bash
# 对于独立的命令，可以并行执行
jdc check & jdc progress &
```

---

## 🔄 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0.0 | 2026-01-29 | 初始版本发布 |

---

## 📞 支持与反馈

如有问题或建议，请通过以下方式反馈:

- 提交 Issue
- 更新文档并提交 PR
- 联系开发团队

---

## 📝 许可证

MIT License

---

## 🎉 致谢

感谢所有为Java Development Claude项目做出贡献的开发者！
