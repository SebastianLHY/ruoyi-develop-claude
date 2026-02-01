# CLI插件系统

> 扩展CLI工具功能的插件机制

---

## 📋 目录

- [简介](#简介)
- [插件类型](#插件类型)
- [插件结构](#插件结构)
- [开发指南](#开发指南)
- [API参考](#api参考)
- [示例插件](#示例插件)
- [最佳实践](#最佳实践)

---

## 🎯 简介

CLI插件系统允许你扩展CLI工具的功能，支持：

- ✅ **命令插件**: 添加新的CLI命令
- ✅ **步骤插件**: 添加自定义开发步骤
- ✅ **智能体插件**: 集成第三方智能体
- ✅ **钩子插件**: 在特定时机执行代码
- ✅ **自定义插件**: 完全自定义的功能

---

## 🔌 插件类型

### 1. 命令插件 (Command Plugin)

添加新的CLI命令。

**用途**:
- 添加自定义命令
- 扩展现有命令功能
- 集成外部工具

**示例**:
```bash
jdc plugin:my-command
```

### 2. 步骤插件 (Step Plugin)

添加自定义开发步骤。

**用途**:
- 添加新的开发步骤
- 自定义工作流
- 集成特定流程

**示例**:
```bash
jdc step:custom-step
```

### 3. 智能体插件 (Agent Plugin)

集成第三方智能体。

**用途**:
- 集成自定义AI助手
- 添加专业领域智能体
- 扩展智能体功能

**示例**:
```bash
jdc agent:custom-agent "任务描述"
```

### 4. 钩子插件 (Hook Plugin)

在特定时机执行代码。

**用途**:
- 执行前置/后置操作
- 监控和日志
- 自动化任务

**钩子类型**:
- `before-command` - 命令执行前
- `after-command` - 命令执行后
- `before-step` - 步骤执行前
- `after-step` - 步骤执行后
- `before-agent` - 智能体执行前
- `after-agent` - 智能体执行后
- `on-error` - 错误发生时
- `on-success` - 成功完成时

### 5. 自定义插件 (Custom Plugin)

完全自定义的功能。

**用途**:
- 实现特殊需求
- 复杂的集成
- 实验性功能

---

## 📁 插件结构

### 最小插件结构

```
my-plugin/
├── plugin.json       # 插件清单（必需）
└── index.js          # 插件主文件（必需）
```

### 完整插件结构

```
my-plugin/
├── plugin.json       # 插件清单
├── index.js          # 插件主文件
├── README.md         # 插件文档
├── config.json       # 插件配置
├── commands/         # 命令文件
│   └── my-command.md
├── agents/           # 智能体文件
│   └── AGENT.md
├── lib/              # 库文件
│   ├── utils.js
│   └── api.js
├── tests/            # 测试文件
│   └── index.test.js
└── package.json      # NPM包配置（可选）
```

---

## 📝 plugin.json 格式

### 必需字段

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "type": "command",
  "description": "我的插件描述"
}
```

### 完整格式

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "type": "command",
  "description": "我的插件描述",
  "author": "作者名称",
  "license": "MIT",
  "main": "index.js",
  "enabled": true,
  "dependencies": {
    "axios": "^1.0.0"
  },
  "config": {
    "apiKey": "",
    "timeout": 5000
  },
  "commands": {
    "my-command": {
      "description": "我的命令",
      "usage": "jdc plugin:my-command [options]",
      "options": {
        "--verbose": "详细输出"
      }
    }
  },
  "hooks": {
    "before-command": true,
    "after-command": true,
    "on-error": true
  }
}
```

### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| name | string | ✅ | 插件名称（唯一） |
| version | string | ✅ | 插件版本（semver） |
| type | string | ✅ | 插件类型 |
| description | string | ✅ | 插件描述 |
| author | string | ❌ | 作者信息 |
| license | string | ❌ | 许可证 |
| main | string | ❌ | 主文件（默认index.js） |
| enabled | boolean | ❌ | 是否启用（默认true） |
| dependencies | object | ❌ | 依赖包 |
| config | object | ❌ | 配置项 |
| commands | object | ❌ | 命令定义 |
| hooks | object | ❌ | 钩子定义 |

---

## 🔨 开发指南

### 1. 创建命令插件

#### 步骤1: 创建插件目录

```bash
cd .claude/cli/plugins
mkdir my-command
cd my-command
```

#### 步骤2: 创建 plugin.json

```json
{
  "name": "my-command",
  "version": "1.0.0",
  "type": "command",
  "description": "我的自定义命令",
  "author": "Your Name"
}
```

#### 步骤3: 创建 index.js

```javascript
/**
 * 我的命令插件
 */

// 初始化函数
function init(config) {
  console.log('插件初始化:', config);
}

// 执行函数
async function execute(args) {
  console.log('执行命令:', args);
  
  // 你的命令逻辑
  const result = {
    success: true,
    message: '命令执行成功',
    data: args
  };
  
  return result;
}

// 启用函数
function enable() {
  console.log('插件已启用');
}

// 禁用函数
function disable() {
  console.log('插件已禁用');
}

// 清理函数
function cleanup() {
  console.log('插件清理完成');
}

// 导出
module.exports = {
  init,
  execute,
  enable,
  disable,
  cleanup
};
```

#### 步骤4: 测试插件

```bash
# 列出所有插件
jdc plugin:list

# 执行插件
jdc plugin:my-command arg1 arg2
```

---

### 2. 创建步骤插件

#### plugin.json

```json
{
  "name": "custom-step",
  "version": "1.0.0",
  "type": "step",
  "description": "自定义开发步骤",
  "author": "Your Name"
}
```

#### index.js

```javascript
/**
 * 自定义步骤插件
 */

async function execute(context) {
  console.log('执行自定义步骤:', context);
  
  // 步骤逻辑
  const result = {
    success: true,
    message: '步骤执行成功',
    context: context
  };
  
  return result;
}

module.exports = {
  execute
};
```

#### 使用

```bash
jdc step:custom-step
```

---

### 3. 创建智能体插件

#### plugin.json

```json
{
  "name": "custom-agent",
  "version": "1.0.0",
  "type": "agent",
  "description": "自定义智能体",
  "author": "Your Name"
}
```

#### index.js

```javascript
/**
 * 自定义智能体插件
 */

async function execute(task) {
  console.log('执行智能体任务:', task);
  
  // 智能体逻辑
  const result = {
    success: true,
    message: '任务执行成功',
    task: task
  };
  
  return result;
}

module.exports = {
  execute
};
```

#### 使用

```bash
jdc agent:custom-agent "分析需求"
```

---

### 4. 创建钩子插件

#### plugin.json

```json
{
  "name": "logger-hook",
  "version": "1.0.0",
  "type": "hook",
  "description": "日志记录钩子",
  "author": "Your Name"
}
```

#### index.js

```javascript
/**
 * 日志钩子插件
 */

const hooks = {
  'before-command': async (context) => {
    console.log('命令执行前:', context);
  },
  
  'after-command': async (context) => {
    console.log('命令执行后:', context);
  },
  
  'on-error': async (context) => {
    console.error('错误发生:', context.error);
  },
  
  'on-success': async (context) => {
    console.log('执行成功:', context);
  }
};

module.exports = {
  hooks
};
```

---

## 📚 API参考

### 插件生命周期

```javascript
// 初始化（可选）
function init(config) {
  // 插件加载时调用
}

// 执行（必需）
async function execute(args) {
  // 插件主要逻辑
  return result;
}

// 启用（可选）
function enable() {
  // 插件启用时调用
}

// 禁用（可选）
function disable() {
  // 插件禁用时调用
}

// 清理（可选）
function cleanup() {
  // 插件卸载时调用
}
```

### 上下文对象

#### 命令上下文

```javascript
{
  plugin: 'plugin-name',
  args: ['arg1', 'arg2'],
  result: { ... }  // after-command钩子中可用
}
```

#### 步骤上下文

```javascript
{
  plugin: 'plugin-name',
  context: {
    step: 'step1',
    data: { ... }
  },
  result: { ... }  // after-step钩子中可用
}
```

#### 智能体上下文

```javascript
{
  plugin: 'plugin-name',
  task: '任务描述',
  result: { ... }  // after-agent钩子中可用
}
```

#### 错误上下文

```javascript
{
  plugin: 'plugin-name',
  error: Error对象,
  args: [...],
  context: { ... }
}
```

---

## 📦 插件管理命令

### 列出插件

```bash
jdc plugin:list
```

### 查看插件信息

```bash
jdc plugin:info <plugin-name>
```

### 启用插件

```bash
jdc plugin:enable <plugin-name>
```

### 禁用插件

```bash
jdc plugin:disable <plugin-name>
```

### 重载插件

```bash
jdc plugin:reload <plugin-name>
```

### 搜索插件

```bash
jdc plugin:search <query>
```

---

## 🌟 示例插件

详见 `examples/` 目录：

1. **hello-world** - 最简单的命令插件
2. **db-backup** - 数据库备份步骤插件
3. **code-analyzer** - 代码分析智能体插件
4. **logger** - 日志记录钩子插件
5. **notification** - 通知提醒插件

---

## 💡 最佳实践

### 1. 命名规范

- 使用小写字母和连字符
- 避免与内置命令冲突
- 使用描述性名称

**示例**:
```
✅ my-custom-command
✅ db-backup-step
✅ code-analyzer-agent
❌ MyCommand
❌ cmd
❌ test
```

### 2. 版本管理

- 遵循语义化版本规范
- 在CHANGELOG中记录变更
- 标注重大变更

### 3. 错误处理

```javascript
async function execute(args) {
  try {
    // 执行逻辑
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### 4. 配置管理

```javascript
function init(config) {
  // 使用默认值
  this.config = {
    timeout: 5000,
    retries: 3,
    ...config
  };
}
```

### 5. 异步操作

```javascript
async function execute(args) {
  // 使用async/await
  const data = await fetchData();
  const result = await processData(data);
  return result;
}
```

### 6. 文档完善

- 编写清晰的README
- 添加使用示例
- 说明配置选项
- 列出依赖项

### 7. 测试覆盖

```javascript
// tests/index.test.js
const plugin = require('../index');

describe('My Plugin', () => {
  test('should execute successfully', async () => {
    const result = await plugin.execute(['arg1']);
    expect(result.success).toBe(true);
  });
});
```

---

## 🔒 安全注意事项

1. **输入验证**: 验证所有用户输入
2. **权限检查**: 检查必要的文件和系统权限
3. **依赖审查**: 审查第三方依赖的安全性
4. **敏感信息**: 不要在代码中硬编码密钥
5. **错误处理**: 避免泄露敏感错误信息

---

## 🐛 调试技巧

### 1. 使用verbose模式

```bash
jdc plugin:my-command --verbose
```

### 2. 查看日志

```javascript
console.log('[DEBUG]', data);
console.error('[ERROR]', error);
```

### 3. 使用调试器

```bash
node --inspect cli.js plugin:my-command
```

---

## 📞 获取帮助

- 查看示例插件
- 阅读API文档
- 提交Issue
- 加入讨论区

---

## 🎉 贡献插件

欢迎分享你的插件！

1. Fork项目
2. 创建插件
3. 编写文档
4. 提交PR

---

**Happy Plugin Development!** 🚀
