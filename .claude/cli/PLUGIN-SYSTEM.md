# CLI插件系统完整指南

> **版本**: v2.0.0  
> **最后更新**: 2026-01-29

---

## 📋 目录

- [系统概述](#系统概述)
- [架构设计](#架构设计)
- [插件类型](#插件类型)
- [开发指南](#开发指南)
- [API参考](#api参考)
- [最佳实践](#最佳实践)
- [示例插件](#示例插件)
- [故障排除](#故障排除)

---

## 🎯 系统概述

### 核心功能

CLI插件系统为Java Development Claude CLI工具提供了灵活的扩展机制：

- ✅ **插件加载**: 自动发现和加载插件
- ✅ **生命周期管理**: 初始化、启用、禁用、卸载
- ✅ **钩子系统**: 在关键时机执行代码
- ✅ **配置管理**: 灵活的配置选项
- ✅ **错误处理**: 完善的错误捕获和处理
- ✅ **热重载**: 支持插件热重载

### 设计目标

1. **易用性**: 简单直观的API
2. **灵活性**: 支持多种插件类型
3. **可靠性**: 完善的错误处理
4. **性能**: 高效的加载和执行
5. **安全性**: 沙箱执行和权限控制

---

## 🏗️ 架构设计

### 系统架构

```
CLI Tool
├── Plugin Manager (插件管理器)
│   ├── Plugin Loader (插件加载器)
│   ├── Hook Manager (钩子管理器)
│   ├── Config Manager (配置管理器)
│   └── Lifecycle Manager (生命周期管理器)
├── Plugins (插件)
│   ├── Command Plugins (命令插件)
│   ├── Step Plugins (步骤插件)
│   ├── Agent Plugins (智能体插件)
│   ├── Hook Plugins (钩子插件)
│   └── Custom Plugins (自定义插件)
└── Core System (核心系统)
    ├── Built-in Commands (内置命令)
    ├── Built-in Steps (内置步骤)
    └── Built-in Agents (内置智能体)
```

### 插件生命周期

```
1. Discovery (发现)
   ↓
2. Load (加载)
   ↓
3. Validate (验证)
   ↓
4. Initialize (初始化)
   ↓
5. Register (注册)
   ↓
6. Enable (启用)
   ↓
7. Execute (执行)
   ↓
8. Disable (禁用)
   ↓
9. Unload (卸载)
```

### 钩子系统

```
Command/Step/Agent Execution
├── before-* (执行前钩子)
│   ├── Hook Plugin 1
│   ├── Hook Plugin 2
│   └── ...
├── [Actual Execution] (实际执行)
├── after-* (执行后钩子)
│   ├── Hook Plugin 1
│   ├── Hook Plugin 2
│   └── ...
└── on-* (事件钩子)
    ├── on-success (成功)
    ├── on-error (错误)
    └── ...
```

---

## 🔌 插件类型

### 1. 命令插件 (Command Plugin)

**用途**: 扩展CLI命令功能

**特点**:
- 添加新的CLI命令
- 独立的命令逻辑
- 参数解析和处理
- 返回执行结果

**示例**:
```javascript
// 命令插件示例
async function execute(args) {
  return {
    success: true,
    message: '命令执行成功'
  };
}
```

**使用**:
```bash
jdc my-command arg1 arg2
```

---

### 2. 步骤插件 (Step Plugin)

**用途**: 添加自定义开发步骤

**特点**:
- 集成到开发流程
- 步骤化执行
- 依赖检查
- 结果验证

**示例**:
```javascript
// 步骤插件示例
async function execute(context) {
  return {
    success: true,
    steps: [...]
  };
}
```

**使用**:
```bash
jdc step:my-step
```

---

### 3. 智能体插件 (Agent Plugin)

**用途**: 集成第三方AI智能体

**特点**:
- AI能力集成
- 任务执行
- 上下文管理
- 结果处理

**示例**:
```javascript
// 智能体插件示例
async function execute(task) {
  const response = await callAI(task);
  return {
    success: true,
    response: response
  };
}
```

**使用**:
```bash
jdc agent:my-agent "任务描述"
```

---

### 4. 钩子插件 (Hook Plugin)

**用途**: 在特定时机执行代码

**特点**:
- 事件驱动
- 无侵入式
- 灵活配置
- 多钩子支持

**钩子类型**:
- `before-command` - 命令执行前
- `after-command` - 命令执行后
- `before-step` - 步骤执行前
- `after-step` - 步骤执行后
- `before-agent` - 智能体执行前
- `after-agent` - 智能体执行后
- `on-error` - 错误发生时
- `on-success` - 成功完成时

**示例**:
```javascript
// 钩子插件示例
const hooks = {
  'before-command': async (context) => {
    console.log('命令执行前:', context);
  }
};
```

---

### 5. 自定义插件 (Custom Plugin)

**用途**: 完全自定义的功能

**特点**:
- 无限制的功能
- 自定义API
- 灵活集成
- 实验性功能

---

## 📚 API参考

### PluginManager类

#### 构造函数

```javascript
const pluginManager = new PluginManager(pluginDir, config);
```

**参数**:
- `pluginDir` (string): 插件目录路径
- `config` (object): 配置对象

---

#### 方法

##### loadPlugins()

加载所有插件。

```javascript
pluginManager.loadPlugins();
```

**返回**: Map<string, Plugin>

---

##### loadPlugin(pluginName)

加载单个插件。

```javascript
pluginManager.loadPlugin('my-plugin');
```

**参数**:
- `pluginName` (string): 插件名称

**返回**: Plugin对象

---

##### getPlugin(name)

获取插件实例。

```javascript
const plugin = pluginManager.getPlugin('my-plugin');
```

**参数**:
- `name` (string): 插件名称

**返回**: Plugin对象 | undefined

---

##### getAllPlugins()

获取所有插件。

```javascript
const plugins = pluginManager.getAllPlugins();
```

**返回**: Array<Plugin>

---

##### getPluginsByType(type)

获取指定类型的插件。

```javascript
const commandPlugins = pluginManager.getPluginsByType('command');
```

**参数**:
- `type` (string): 插件类型

**返回**: Array<Plugin>

---

##### enablePlugin(name)

启用插件。

```javascript
pluginManager.enablePlugin('my-plugin');
```

**参数**:
- `name` (string): 插件名称

---

##### disablePlugin(name)

禁用插件。

```javascript
pluginManager.disablePlugin('my-plugin');
```

**参数**:
- `name` (string): 插件名称

---

##### reloadPlugin(name)

重载插件。

```javascript
pluginManager.reloadPlugin('my-plugin');
```

**参数**:
- `name` (string): 插件名称

---

##### executeCommandPlugin(pluginName, args)

执行命令插件。

```javascript
await pluginManager.executeCommandPlugin('my-command', ['arg1', 'arg2']);
```

**参数**:
- `pluginName` (string): 插件名称
- `args` (Array): 命令参数

**返回**: Promise<Object>

---

##### executeStepPlugin(pluginName, context)

执行步骤插件。

```javascript
await pluginManager.executeStepPlugin('my-step', { data: {} });
```

**参数**:
- `pluginName` (string): 插件名称
- `context` (Object): 执行上下文

**返回**: Promise<Object>

---

##### executeAgentPlugin(pluginName, task)

执行智能体插件。

```javascript
await pluginManager.executeAgentPlugin('my-agent', '任务描述');
```

**参数**:
- `pluginName` (string): 插件名称
- `task` (string): 任务描述

**返回**: Promise<Object>

---

##### executeHook(hookType, context)

执行钩子。

```javascript
await pluginManager.executeHook('before-command', { plugin: 'test' });
```

**参数**:
- `hookType` (string): 钩子类型
- `context` (Object): 上下文对象

---

### 插件接口

#### 必需方法

##### execute(args)

执行插件主逻辑。

```javascript
async function execute(args) {
  // 实现逻辑
  return { success: true };
}
```

**参数**:
- `args` (any): 执行参数

**返回**: Promise<Object>

---

#### 可选方法

##### init(config)

初始化插件。

```javascript
function init(config) {
  // 初始化逻辑
}
```

---

##### enable()

启用插件。

```javascript
function enable() {
  // 启用逻辑
}
```

---

##### disable()

禁用插件。

```javascript
function disable() {
  // 禁用逻辑
}
```

---

##### cleanup()

清理资源。

```javascript
function cleanup() {
  // 清理逻辑
}
```

---

## 💡 最佳实践

### 1. 错误处理

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

### 2. 配置管理

```javascript
let config = {
  option1: 'default1',
  option2: 'default2'
};

function init(globalConfig) {
  // 合并配置
  config = { ...config, ...globalConfig };
}
```

### 3. 日志记录

```javascript
async function execute(args) {
  console.log('[plugin-name] 开始执行');
  // ...
  console.log('[plugin-name] 执行完成');
}
```

### 4. 异步操作

```javascript
async function execute(args) {
  // 使用async/await
  const data = await fetchData();
  const result = await processData(data);
  return result;
}
```

### 5. 资源清理

```javascript
function cleanup() {
  // 关闭连接
  // 释放资源
  // 清理缓存
}
```

---

## 📦 示例插件

### Hello World

最简单的命令插件示例。

**位置**: `plugins/examples/hello-world/`

**功能**: 显示Hello World消息

**使用**:
```bash
jdc hello-world
jdc hello-world Alice
jdc hello-world Bob --uppercase
```

---

### Custom Agent

自定义智能体示例。

**位置**: `plugins/examples/custom-agent/`

**功能**: 演示如何创建AI智能体插件

**使用**:
```bash
jdc agent:custom-agent "分析需求"
```

---

### Custom Step

自定义步骤示例。

**位置**: `plugins/examples/custom-step/`

**功能**: 演示如何创建开发步骤插件

**使用**:
```bash
jdc step:custom-step
```

---

### Logger Hook

日志钩子示例。

**位置**: `plugins/examples/logger-hook/`

**功能**: 记录所有命令执行日志

**自动启用**: 加载后自动工作

---

## 🐛 故障排除

### 1. 插件加载失败

**问题**: `插件缺少 plugin.json`

**解决**:
- 确保插件目录包含 plugin.json
- 检查 JSON 格式是否正确

---

### 2. 插件执行失败

**问题**: `插件缺少execute方法`

**解决**:
- 确保 index.js 导出 execute 函数
- 检查函数签名是否正确

---

### 3. 配置不生效

**问题**: 配置修改后不生效

**解决**:
```bash
# 重载插件
jdc plugin:reload my-plugin
```

---

### 4. 钩子不执行

**问题**: 钩子插件不工作

**解决**:
- 检查 plugin.json 中 hooks 配置
- 确保插件已启用
- 检查钩子类型名称是否正确

---

### 5. 依赖问题

**问题**: 插件依赖的包未安装

**解决**:
```bash
cd .claude/cli/plugins/my-plugin
npm install
```

---

## 🔒 安全注意事项

1. **输入验证**: 始终验证用户输入
2. **权限控制**: 检查文件和系统权限
3. **依赖审查**: 审查第三方依赖
4. **敏感信息**: 不要硬编码密钥
5. **错误处理**: 避免泄露敏感信息

---

## 📈 性能优化

1. **懒加载**: 按需加载插件
2. **缓存**: 缓存频繁使用的数据
3. **异步**: 使用异步操作
4. **资源管理**: 及时释放资源
5. **批处理**: 批量处理操作

---

## 🎉 贡献插件

欢迎贡献你的插件！

1. Fork项目
2. 创建插件
3. 编写文档
4. 添加测试
5. 提交PR

---

## 📞 获取帮助

- 查看 [README.md](plugins/README.md)
- 查看示例插件
- 提交Issue
- 加入讨论区

---

**Happy Plugin Development!** 🚀
