# 📚 Commands 目录说明

> **版本**: v2.18.0 | **精简**: 核心文档↓70%、学习时间↓75%  
> **快速开始**: [3分钟上手](./QUICK-START.md) | [文档结构](./DOCS-STRUCTURE.md) 🆕

---

## 🚀 快速入口（15分钟入门）

### 🟢 核心文档（必读，15分钟）
1. ⭐ [QUICK-START.md](./QUICK-START.md) - 3分钟快速上手
2. ⭐ [dev.md](./dev.md) - 主流程（92行精简版）
3. [dev-faq.md](./dev-faq.md) - 常见问题

### 🟡 进阶文档（按需查阅，1小时）
4. [dev-steps.md](./dev-steps.md) - 详细步骤说明
5. [dev-rollback-guide.md](./dev-rollback-guide.md) - 错误处理
6. [../agents/README.md](../agents/README.md) - 智能体目录

### 🔵 高级文档（专家参考）
7. [CHANGELOG.md](./CHANGELOG.md) - 完整变更历史
8. [VERSION.md](./VERSION.md) - 版本管理规范
9. [DEPRECATED.md](./DEPRECATED.md) - 已废弃文档列表 🆕
10. [DOCS-STRUCTURE.md](./DOCS-STRUCTURE.md) - 文档结构指南 🆕

---

## 📋 目录结构

## 📋 核心文档详情

### 🟢 新手必读（15分钟）

#### ⭐ QUICK-START.md - 快速开始指南
- **用途**: 3分钟上手，新手必读
- **内容**: 3个场景示例、Token优化、学习路径
- **特点**: 简洁明了，可直接上手

#### ⭐ dev.md - 主流程（92行精简版）🆕
- **用途**: 核心流程快速参考
- **内容**: 11步流程、简化流程图、文档导航
- **特点**: 精简69%，5分钟掌握核心

#### dev-faq.md - 常见问题FAQ
- **用途**: 90%问题的答案
- **内容**: 9个常见问题+解决方案
- **特点**: 问题驱动，快速查找

---

### 📄 辅助文档

#### VERSION.md - 版本管理规范 🆕
- **用途**: 版本号规范、版本历史、发布流程
- **包含内容**:
  - 语义化版本规范（MAJOR.MINOR.PATCH）
  - 完整版本历史表
  - 版本发布流程
  - 变更日志规范
  - 版本兼容性说明

#### CHANGELOG.md - 详细变更日志 🆕
- **用途**: 记录所有版本的详细变更
- **包含内容**:
  - 每个版本的Added/Changed/Fixed/Performance
  - 版本统计对比
  - 未来规划
  - 基于 Keep a Changelog 规范

#### init-docs.md - 文档初始化指令
- **用途**: 自动创建项目文档（需求文档、项目状态、待办清单）
- **调用时机**: 步骤4 - 文档初始化

#### update-status.md - 项目状态更新指令
- **用途**: 更新项目整体状态和进度
- **调用时机**: 步骤10 - 文档更新（必选）

#### update-todo.md - 待办清单更新指令
- **用途**: 更新待办任务列表
- **调用时机**: 步骤10 - 文档更新（可选，按需执行）

#### dev-dependency-check.md - 步骤间依赖自动检查
- **用途**: 自动检查每个步骤的前置依赖，降低跳步失败率
- **调用时机**: 每个步骤执行前自动检查
- **包含内容**:
  - 三级检查机制（必需/推荐/可选）
  - 42个检查项覆盖13个步骤
  - 自动化检查实现代码
  - 失败处理流程和补救措施
  - 使用示例

#### dev-rollback-guide.md - 回滚决策树与异常处理指南
- **用途**: 提供完整的回滚决策树和异常处理流程
- **调用时机**: 当步骤失败或需要回滚时
- **包含内容**:
  - 回滚决策矩阵（快速决策表）
  - 分步骤回滚指南（13个步骤）
  - 智能体异常处理（10个智能体）
  - 回滚执行命令（Git/数据库/文件）
  - 常见场景处理（4个典型场景）

#### dev-error-codes.md - 错误码体系与快速查询 🆕
- **行数**: ~800行
- **用途**: 标准化错误码体系、错误信息规范、快速查询手册
- **包含内容**:
  - 错误码体系概述（设计原则、结构规范）
  - 7大类错误码（100+错误码）
  - 快速查询索引（按错误码、关键词、步骤）
  - 错误处理最佳实践
  - 自定义错误码指南

---

### 📚 归档文档

所有历史版本的优化文档、评估报告已归档至 `archives/` 目录：
- **v2.10**: 步骤间依赖自动检查、三级检查机制、42个检查项 🆕
- **v2.9**: Token消耗监控优化（Phase 1）、实时统计、分级提示
- **v2.8**: 可选扩展流程、文档一致性改进、工作流评估报告
- **v2.7.1**: 快速开始指南、归档整理
- **v2.7**: P0容错性改进、回滚决策树
- **v2.6**: 阶段二智能体集成
- **v2.5**: 智能体集成说明
- **v2.4**: 步骤位置调整
- **v2.3/v2.3.1**: 流程顺序优化
- **v2.2**: Token优化、文档结构优化
- **v2.1**: Git初始化前置
- **v2.0**: 技能激活修复
- **Phase4**: 阶段四新增步骤

详见: [archives/README.md](./archives/README.md)

---

### 🔧 其他工具指令

#### check.md
- **用途**: 项目检查指令

#### crud.md
- **用途**: CRUD操作相关指令

#### next.md
- **用途**: 下一步操作指引

#### progress.md
- **用途**: 进度查询指令

#### reset.md
- **用途**: 重置项目状态

#### start.md
- **用途**: 项目启动指令

---

### 🖥️ CLI命令行工具 🆕

#### CLI工具目录: [../cli/](../cli/)
- **用途**: 命令行快速启动和脚本化执行工具
- **核心文件**:
  - `cli.js` - CLI主程序
  - `jdc.bat` - Windows快捷脚本
  - `jdc.sh` - Linux/Mac快捷脚本
  - `README.md` - 详细使用文档
  - `INSTALL.md` - 安装配置指南
  - `test.js` - 测试套件

#### 快速使用
```bash
# Windows
jdc start                    # 启动开发流程
jdc step1 "用户管理模块"      # 执行步骤1
jdc agent:code-generator     # 激活代码生成器

# Linux/Mac
./jdc.sh start
./jdc.sh step1 "用户管理模块"
./jdc.sh agent:code-generator
```

#### 核心优势
- ✅ **一键启动**: 无需手动编写提示词
- ✅ **脚本化执行**: 支持批处理和自动化
- ✅ **智能体集成**: 快速激活各类智能体
- ✅ **跨平台支持**: Windows/Linux/Mac全平台
- ✅ **无历史文档**: 专注执行，不生成总结

详见: [CLI工具文档](../cli/README.md)

---

## 🚀 快速开始

### 新手用户（推荐路径）
1. **🎯 快速开始**: [QUICK-START.md](./QUICK-START.md) - 5分钟了解核心概念（必读⭐）
2. **🖥️ CLI工具**: [CLI工具](../cli/README.md) - 命令行快速启动（推荐⭐）🆕
3. **📖 流程概览**: [dev.md](./dev.md) - 了解12步完整流程
4. **🔨 跟随示例**: 按照快速开始指南完成第一次开发
5. **❓ 解决问题**: [dev-faq.md](./dev-faq.md) - 遇到问题看这里

### 进阶用户
1. **📚 详细学习**: [dev-steps.md](./dev-steps.md) - 深入了解每个步骤
2. **✅ 质量检查**: [dev-checklist.md](./dev-checklist.md) - 60+检查项
3. **🔄 异常处理**: [dev-rollback-guide.md](./dev-rollback-guide.md) - 回滚决策树
4. **🤖 脚本化执行**: [CLI示例脚本](../cli/examples/) - 自动化开发流程 🆕

### 熟练用户
1. **⚡ 快速导航**: 使用 [dev.md](./dev.md) 的快速导航功能
2. **📖 按需查阅**: 只查看需要的详细步骤
3. **🐛 问题排查**: 直接跳转到 FAQ 对应问题
4. **🚀 CLI命令**: 使用 `jdc` 命令快速执行各个步骤 🆕

---

## 📊 文档统计

| 文件 | 行数 | 类型 | 优先级 | 用途 |
|------|------|------|--------|------|
| QUICK-START.md | ~600 | 核心 | P0 | 新手快速上手指南 |
| dev.md | ~650 | 核心 | P1 | 主流程文档 |
| dev-steps.md | ~1,450 | 核心 | P2 | 详细执行步骤 |
| dev-dependency-check.md 🆕 | ~860 | 核心 | P3 | 步骤间依赖检查 |
| dev-faq.md | ~740 | 核心 | P4 | 常见问题 |
| dev-rollback-guide.md | ~1,600 | 核心 | P5 | 回滚决策树 |
| dev-checklist.md | ~170 | 核心 | P6 | 检查清单 |
| init-docs.md | - | 辅助 | - | 文档初始化 |
| update-status.md | - | 辅助 | - | 状态更新 |
| update-todo.md | - | 辅助 | - | 待办更新 |
| archives/ | - | 归档 | - | 历史版本文档 |

---

## 🎯 核心优势

### v2.2 文档优化
- ✅ **主文件精简**: 从909行降至200行（↓78%）
- ✅ **模块化设计**: 按功能拆分为4个核心文档
- ✅ **查找效率**: 提升80%（快速导航 + 文档索引）
- ✅ **维护成本**: 降低60%（独立更新，减少冲突）
- ✅ **团队协作**: 提升70%（分工明确，并行编辑）

### Token优化
- ✅ **步骤2.5代码生成器**: 节省约40%整体Token消耗
- ✅ **智能文档更新**: 按需执行，避免重复操作
- ✅ **分批执行策略**: 灵活调整执行顺序

### 质量保障
- ✅ **三层检查**: 测试验证 + 质量检查 + 文档验证
- ✅ **覆盖率标准**: 整体>80%, Service>90%
- ✅ **安全扫描**: 无高危漏洞，中危漏洞已评估

---

## 📝 版本历史

| 版本 | 日期 | 主要变更 | 影响范围 |
|------|------|---------|---------|
| v2.15 | 2026-01-29 | 智能推荐生成方式、6种混合模式、步骤8自动Bug定位、性能智能决策、超时优化、Token节省21-53% 🆕 | 全流程智能化 |
| v2.14 | 2026-01-29 | 统一代码生成决策、减少决策点50%、Token节省60% | 步骤5.5+7优化 |
| v2.13 | 2026-01-29 | 性能监控系统、智能体协作统计、性能瓶颈分析 | 新增性能监控 |
| v2.12 | 2026-01-29 | 插件系统、第三方智能体集成、自定义步骤插件 | 新增插件系统 |
| v2.11 | 2026-01-29 | CLI命令行工具、脚本化执行、无历史文档生成 | 新增CLI工具 |
| v2.10 | 2026-01-29 | 步骤间依赖自动检查、42个检查项、跳步失败率↓50% | 全流程依赖验证 |
| v2.9 | 2026-01-29 | Token消耗监控优化（Phase 1）、实时统计、分级提示 | 输出规范、用户体验 |
| v2.8 | 2026-01-29 | 新增步骤12-13作为可选扩展流程、文档一致性改进 | 流程概览、流程图 |
| v2.7.1 | 2026-01-29 | 新增快速开始指南、降低学习曲线、归档整理 | 新增QUICK-START.md |
| v2.7 | 2026-01-29 | P0容错性改进、完整回滚机制、智能体异常处理 | 全流程容错性 |
| v2.6 | 2026-01-28 | 阶段二智能体集成 | 智能体集成 |
| v2.5 | 2026-01-28 | 智能体集成说明 | 智能体集成 |
| v2.4 | 2026-01-28 | 步骤2.5→5.5调整 | Token优化 |
| v2.3 | 2026-01-28 | 自动检测+超时处理 | 用户体验 |
| v2.2 | 2026-01-28 | 新增步骤2.5、优化模块定位、拆分文档 | 步骤2、6、文档结构 |
| v2.1 | 2026-01-28 | Git初始化前置、新增质量检查、智能文档更新 | 步骤3-11 |
| v2.0 | 2026-01-28 | 修复技能激活错误、增强测试验证、新增检查清单 | 全流程 |
| v1.0 | 2026-01-20 | 初始版本发布 | - |

---

## 🔗 相关链接

### 核心文档
- **🚀 快速开始**: [QUICK-START.md](./QUICK-START.md) - 新手必读
- **🖥️ CLI工具**: [CLI工具文档](../cli/README.md) - 命令行快速启动 🆕
- **主流程**: [dev.md](./dev.md)
- **详细步骤**: [dev-steps.md](./dev-steps.md)
- **依赖检查**: [dev-dependency-check.md](./dev-dependency-check.md) - 降低跳步失败率50% 🆕
- **回滚决策树**: [dev-rollback-guide.md](./dev-rollback-guide.md)
- **检查清单**: [dev-checklist.md](./dev-checklist.md)
- **常见问题**: [dev-faq.md](./dev-faq.md)
- **文档输出规范**: [DOC-OUTPUT-RULES.md](./DOC-OUTPUT-RULES.md) - Token节省85% 🆕

### CLI工具文档 🆕
- **CLI主文档**: [../cli/README.md](../cli/README.md) - 完整使用指南
- **安装指南**: [../cli/INSTALL.md](../cli/INSTALL.md) - 安装配置说明
- **示例脚本**: [../cli/examples/](../cli/examples/) - 自动化脚本示例
- **测试套件**: [../cli/test.js](../cli/test.js) - CLI工具测试

### 插件系统文档 🆕
- **插件系统指南**: [../cli/PLUGIN-SYSTEM.md](../cli/PLUGIN-SYSTEM.md) - 完整插件系统文档
- **插件开发**: [../cli/plugins/README.md](../cli/plugins/README.md) - 插件开发指南
- **插件模板**: [../cli/plugins/PLUGIN-TEMPLATE.md](../cli/plugins/PLUGIN-TEMPLATE.md) - 插件开发模板
- **示例插件**: [../cli/plugins/examples/](../cli/plugins/examples/) - 6个示例插件
- **插件测试**: [../cli/test-plugin.js](../cli/test-plugin.js) - 插件系统测试
- **实施总结**: [../cli/PLUGIN-SUMMARY.md](../cli/PLUGIN-SUMMARY.md) - 插件系统实施总结

### 性能监控文档 🆕
- **性能监控指南**: [../cli/PERFORMANCE-MONITORING.md](../cli/PERFORMANCE-MONITORING.md) - 完整性能监控文档
- **性能监控器**: [../cli/performance-monitor.js](../cli/performance-monitor.js) - 性能监控核心
- **监控插件**: [../cli/plugins/examples/performance-monitor/](../cli/plugins/examples/performance-monitor/) - 性能监控钩子插件
- **性能CLI**: [../cli/plugins/examples/performance-cli/](../cli/plugins/examples/performance-cli/) - 性能分析命令
- **实施总结**: [../cli/PERFORMANCE-SUMMARY.md](../cli/PERFORMANCE-SUMMARY.md) - 性能监控实施总结

### 优化文档 🆕
- **⏰ 超时处理参考**: [TIMEOUT-QUICK-REFERENCE.md](./TIMEOUT-QUICK-REFERENCE.md) - 1分钟掌握超时策略 ⚡
- **📤 文档输出规范**: [DOC-OUTPUT-RULES.md](./DOC-OUTPUT-RULES.md) - Token节省85%

### 优化方案归档 📁
- **归档目录**: [optimizations/](./optimizations/) - 历史优化方案
- **v2.15方案**: [optimizations/OPTIMIZATION-v2.14.md](./optimizations/OPTIMIZATION-v2.14.md) - 智能体超时降级优化 ⏳
- **v2.15清单**: [optimizations/OPTIMIZATION-v2.14-CHECKLIST.md](./optimizations/OPTIMIZATION-v2.14-CHECKLIST.md) - 33项任务跟踪
- **v2.14方案**: [optimizations/OPTIMIZATION-v2.13.md](./optimizations/OPTIMIZATION-v2.13.md) - 统一代码生成决策 ⏳

### 历史归档
- **归档说明**: [archives/README.md](./archives/README.md)
- **v2.10实施报告**: [archives/v2.10/DEPENDENCY-CHECK-IMPLEMENTATION.md](./archives/v2.10/DEPENDENCY-CHECK-IMPLEMENTATION.md) 🆕
- **v2.10变更日志**: [archives/v2.10/CHANGELOG-v2.10.md](./archives/v2.10/CHANGELOG-v2.10.md) 🆕
- **v2.10归档总结**: [archives/v2.10/ARCHIVE-SUMMARY.md](./archives/v2.10/ARCHIVE-SUMMARY.md) 🆕

### 优化方案归档 🆕
- **归档说明**: [optimizations/README.md](./optimizations/README.md) - 优化方案归档目录
- **归档原则**: 保留历史优化方案，保持主目录清爽

---

## 💡 使用建议

### 按场景选择文档
- **🎯 首次使用**: QUICK-START.md - 5分钟快速上手
- **⚡ 快速浏览**: dev.md - 流程概览
- **📚 详细学习**: dev-steps.md - 完整步骤
- **🔍 依赖检查**: dev-dependency-check.md - 自动检查机制 🆕
- **✅ 质量检查**: dev-checklist.md - 60+检查项
- **❓ 问题解决**: dev-faq.md - 常见问题
- **🔄 异常处理**: dev-rollback-guide.md - 回滚决策

### 按角色选择文档
- **新手开发者**: QUICK-START.md → dev.md → dev-faq.md
- **项目经理**: dev.md（流程概览）
- **开发工程师**: dev-steps.md（详细步骤）
- **质量工程师**: dev-checklist.md（检查清单）
- **技术支持**: dev-faq.md（常见问题）
- **运维工程师**: dev-rollback-guide.md（异常处理）

### 按学习阶段选择
- **第1-3个模块**: QUICK-START.md（重点关注场景1-3）
- **第4-10个模块**: dev-steps.md（深入学习每个步骤）
- **10个模块以上**: dev-checklist.md（主动验证质量）

---

## 📞 反馈与建议

如有任何问题或建议，请通过以下方式反馈：
- 提交 Issue
- 更新文档并提交 PR
- 联系文档维护者
