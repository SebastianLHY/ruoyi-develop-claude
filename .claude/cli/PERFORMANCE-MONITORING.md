# CLI性能监控系统

> **版本**: v1.0.0  
> **最后更新**: 2026-01-29

---

## 📋 目录

- [系统概述](#系统概述)
- [核心功能](#核心功能)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
- [API参考](#api参考)
- [性能分析](#性能分析)
- [最佳实践](#最佳实践)

---

## 🎯 系统概述

CLI性能监控系统提供全面的性能监控和分析功能：

### 核心功能

- ✅ **自动监控**: 自动监控所有命令、步骤、智能体的执行
- ✅ **耗时统计**: 精确记录每个操作的执行时间
- ✅ **智能体协作**: 专门统计智能体协作的耗时分布
- ✅ **性能瓶颈**: 自动识别和报告性能瓶颈
- ✅ **优化建议**: 基于数据生成优化建议
- ✅ **数据导出**: 支持多种格式导出性能数据
- ✅ **历史分析**: 保存和分析历史性能数据

### 监控维度

1. **命令执行**: 所有CLI命令的执行时间
2. **步骤执行**: 开发流程各步骤的执行时间
3. **智能体执行**: 单个智能体和协作的执行时间
4. **插件执行**: 插件命令的执行时间
5. **钩子执行**: 钩子函数的执行时间

---

## ⚡ 核心功能

### 1. 性能数据收集

**自动收集**:
- 操作开始/结束时间
- 操作类型和名称
- 执行结果
- 系统信息

**数据类型**:
```javascript
{
  operationId: 'op-xxx',
  type: 'command|step|agent|plugin|hook',
  name: '操作名称',
  startTime: 1234567890,
  endTime: 1234567900,
  duration: 10,
  result: { success: true },
  metadata: {}
}
```

---

### 2. 智能体协作统计

**协作场景**:
- 多个智能体顺序执行
- 多个智能体并行执行
- 智能体之间的数据传递

**统计维度**:
```javascript
{
  collaborationType: 'sequential|parallel',
  agents: [
    { name: 'agent1', duration: 1000, percentage: 50 },
    { name: 'agent2', duration: 1000, percentage: 50 }
  ],
  totalDuration: 2000
}
```

---

### 3. 性能瓶颈分析

**识别标准**:
- 执行时间超过阈值
- 执行时间占比过高
- 频繁执行且耗时长

**阈值配置**:
```javascript
{
  command: 30000,      // 30秒
  step: 60000,         // 60秒
  agent: 120000,       // 120秒
  plugin: 10000,       // 10秒
  hook: 1000           // 1秒
}
```

---

### 4. 性能指标

**统计指标**:
- `count`: 执行次数
- `totalDuration`: 总耗时
- `avgDuration`: 平均耗时
- `minDuration`: 最小耗时
- `maxDuration`: 最大耗时
- `lastDuration`: 最后一次耗时

---

## 🚀 快速开始

### 1. 启用性能监控

性能监控插件默认启用，无需额外配置。

### 2. 执行命令

```bash
# 执行任意命令，自动记录性能
jdc start
jdc step1 "用户管理模块"
jdc agent:code-generator "生成代码"
```

### 3. 查看性能报告

```bash
# 显示完整性能报告
jdc perf report

# 显示性能瓶颈
jdc perf bottlenecks

# 显示智能体统计
jdc perf agents
```

---

## 📖 使用指南

### 查看性能报告

```bash
jdc perf report
```

**输出示例**:
```
======================================================================
🚀 性能监控报告
======================================================================

📊 总体摘要:
  总操作数: 25
  总耗时: 5m30s
  平均耗时: 13.2s

📝 命令执行统计:
  ------------------------------------------------------------------
  命令名称                  次数    平均耗时    最大耗时    最小耗时
  ------------------------------------------------------------------
  start                      3      12.5s      15.2s       10.1s
  check                      5       2.3s       3.1s        1.8s
  
🔧 步骤执行统计:
  ------------------------------------------------------------------
  步骤名称                  次数    平均耗时    最大耗时    最小耗时
  ------------------------------------------------------------------
  step1                      2      25.3s      28.1s       22.5s
  step6                      1      85.2s      85.2s       85.2s
  
🤖 智能体执行统计:
  ------------------------------------------------------------------
  智能体名称                次数    平均耗时    最大耗时    最小耗时
  ------------------------------------------------------------------
  code-generator             3      45.5s      52.3s       38.7s
  requirements-analyst       2      32.1s      35.2s       29.0s

======================================================================
```

---

### 查看性能瓶颈

```bash
jdc perf bottlenecks --limit 5
```

**输出示例**:
```
======================================================================
🐌 性能瓶颈分析
======================================================================

🔝 Top 5 性能瓶颈:
  ------------------------------------------------------------------
  类型/名称                            平均耗时    最大耗时    次数
  ------------------------------------------------------------------
   1. steps/step6                        85.2s      90.5s        3
   2. agents/code-generator              45.5s      52.3s        5
   3. commands/start                     12.5s      15.2s        8
   4. agents/requirements-analyst        32.1s      35.2s        2
   5. steps/step7                        28.3s      31.1s        3

💡 优化建议:
  1. steps/step6
     平均耗时 85.2s，建议优化执行逻辑
  2. agents/code-generator
     平均耗时 45.5s，建议优化执行逻辑

======================================================================
```

---

### 导出性能数据

```bash
# 导出为JSON
jdc perf export --output report.json --format json

# 导出为HTML
jdc perf export --output report.html --format html

# 导出为文本
jdc perf export --output report.txt --format text
```

---

### 清理旧数据

```bash
# 清理7天前的数据（默认）
jdc perf clean

# 清理30天前的数据
jdc perf clean --days 30
```

---

### 重置所有数据

```bash
jdc perf reset
```

---

## 🔧 配置说明

### 插件配置

编辑 `plugins/examples/performance-monitor/plugin.json`:

```json
{
  "config": {
    "enabled": true,
    "logDir": ".performance",
    "autoReport": false,
    "reportInterval": 3600000,
    "thresholds": {
      "command": 30000,
      "step": 60000,
      "agent": 120000,
      "plugin": 10000,
      "hook": 1000
    }
  }
}
```

**配置项说明**:

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| enabled | boolean | true | 是否启用监控 |
| logDir | string | .performance | 日志目录 |
| autoReport | boolean | false | 自动生成报告 |
| reportInterval | number | 3600000 | 报告间隔(ms) |
| thresholds | object | - | 性能阈值配置 |

---

## 📊 API参考

### PerformanceMonitor类

#### 构造函数

```javascript
const monitor = new PerformanceMonitor(options);
```

**参数**:
- `options.enabled` (boolean): 是否启用
- `options.logDir` (string): 日志目录
- `options.thresholds` (object): 阈值配置

---

#### startSession(sessionId)

开始新的监控会话。

```javascript
const sessionId = monitor.startSession();
```

**返回**: sessionId

---

#### endSession(sessionId)

结束监控会话。

```javascript
monitor.endSession(sessionId);
```

---

#### startOperation(type, name, metadata)

开始操作计时。

```javascript
const operationId = monitor.startOperation('command', 'start', {
  args: ['arg1']
});
```

**参数**:
- `type`: 操作类型 (command/step/agent/plugin/hook)
- `name`: 操作名称
- `metadata`: 元数据

**返回**: operationId

---

#### endOperation(operationId, result)

结束操作计时。

```javascript
monitor.endOperation(operationId, {
  success: true
});
```

---

#### recordAgentCollaboration(agents, startTime, endTime, result)

记录智能体协作。

```javascript
monitor.recordAgentCollaboration([
  { name: 'agent1', startTime: 1000, endTime: 2000 },
  { name: 'agent2', startTime: 2000, endTime: 3000 }
], 1000, 3000);
```

---

#### getPerformanceReport(options)

获取性能报告。

```javascript
const report = monitor.getPerformanceReport({
  limit: 10
});
```

**返回**:
```javascript
{
  timestamp: 1234567890,
  summary: { ... },
  metrics: { ... },
  topBottlenecks: [ ... ],
  recommendations: [ ... ]
}
```

---

#### printReport()

打印性能报告到控制台。

```javascript
monitor.printReport();
```

---

#### exportReport(outputFile)

导出性能报告。

```javascript
monitor.exportReport('report.json');
```

---

#### cleanup(daysToKeep)

清理旧数据。

```javascript
monitor.cleanup(7); // 清理7天前的数据
```

---

## 📈 性能分析

### 智能体协作分析

**场景1: 顺序执行**

```
Agent1 (10s) → Agent2 (15s) → Agent3 (8s)
总耗时: 33s
```

**分析**:
- Agent1: 30.3%
- Agent2: 45.5%
- Agent3: 24.2%

**优化建议**: Agent2是瓶颈，优先优化

---

**场景2: 并行执行**

```
     ┌─ Agent1 (10s) ─┐
Start ├─ Agent2 (15s) ─┤ End
     └─ Agent3 (8s) ──┘
总耗时: 15s
```

**分析**:
- 并行度: 3
- 最慢: Agent2 (15s)
- 资源利用率: 73.3%

**优化建议**: 提升Agent2性能可显著降低总耗时

---

### 性能瓶颈分类

**1. 时间瓶颈**
- 单次执行时间过长
- 阈值: > 阈值配置

**2. 频率瓶颈**
- 频繁执行且耗时
- 标准: count > 10 && avgDuration > 5s

**3. 占比瓶颈**
- 占总时间比例过高
- 标准: percentage > 50%

---

### 优化建议生成

**规则1**: 严重瓶颈
```
IF percentage > 50% THEN
  priority = 'high'
  suggestion = '建议优化执行逻辑或异步处理'
```

**规则2**: 智能体协作
```
IF avgCollabDuration > 60s THEN
  priority = 'medium'
  suggestion = '考虑并行执行或优化响应时间'
```

**规则3**: 操作数量
```
IF operationCount > 50 THEN
  priority = 'low'
  suggestion = '考虑拆分为多个会话'
```

---

## 💡 最佳实践

### 1. 定期查看报告

```bash
# 每天查看性能报告
jdc perf report

# 每周导出详细数据
jdc perf export --output weekly-report.json
```

### 2. 关注性能瓶颈

```bash
# 定期检查瓶颈
jdc perf bottlenecks --limit 10

# 针对性优化
```

### 3. 监控智能体协作

```bash
# 查看智能体统计
jdc perf agents

# 优化协作流程
```

### 4. 合理设置阈值

```javascript
// 根据实际情况调整阈值
{
  command: 30000,   // 简单命令: 30s
  step: 60000,      // 开发步骤: 60s
  agent: 120000,    // AI智能体: 120s
  plugin: 10000,    // 插件: 10s
  hook: 1000        // 钩子: 1s
}
```

### 5. 定期清理数据

```bash
# 每月清理一次
jdc perf clean --days 30
```

---

## 🔍 故障排除

### 问题1: 没有性能数据

**原因**: 性能监控未启用

**解决**:
```bash
# 检查插件状态
jdc plugin:info performance-monitor

# 启用插件
jdc plugin:enable performance-monitor
```

---

### 问题2: 数据不准确

**原因**: 时钟不同步

**解决**:
- 确保系统时钟准确
- 检查时区设置

---

### 问题3: 磁盘空间不足

**原因**: 性能数据积累过多

**解决**:
```bash
# 清理旧数据
jdc perf clean --days 7

# 或重置所有数据
jdc perf reset
```

---

## 📊 数据格式

### 性能指标

```json
{
  "commands": {
    "start": {
      "count": 10,
      "totalDuration": 125000,
      "avgDuration": 12500,
      "minDuration": 10100,
      "maxDuration": 15200,
      "lastDuration": 12800
    }
  },
  "steps": { ... },
  "agents": { ... },
  "plugins": { ... },
  "hooks": { ... }
}
```

### 会话数据

```json
{
  "id": "session-xxx",
  "startTime": 1234567890,
  "endTime": 1234567900,
  "duration": 10,
  "operations": [
    {
      "id": "op-xxx",
      "type": "command",
      "name": "start",
      "startTime": 1234567890,
      "endTime": 1234567895,
      "duration": 5,
      "result": { "success": true }
    }
  ],
  "system": {
    "platform": "win32",
    "cpus": 8,
    "totalMemory": 16000000000
  },
  "analysis": {
    "bottlenecks": [ ... ],
    "recommendations": [ ... ]
  }
}
```

---

## 🎯 使用场景

### 场景1: 日常性能监控

```bash
# 每天执行
jdc perf report > daily-report.txt
```

### 场景2: 性能优化

```bash
# 1. 识别瓶颈
jdc perf bottlenecks

# 2. 优化代码

# 3. 对比性能
jdc perf report
```

### 场景3: 智能体调优

```bash
# 查看智能体统计
jdc perf agents

# 优化智能体响应
# 调整并行度
```

### 场景4: 问题诊断

```bash
# 导出详细数据
jdc perf export --output debug.json

# 分析数据
# 定位问题
```

---

## 📞 获取帮助

- 查看 [CLI README](README.md)
- 查看 [插件系统文档](PLUGIN-SYSTEM.md)
- 提交Issue

---

**性能监控，让你的CLI更快更稳定！** 🚀
