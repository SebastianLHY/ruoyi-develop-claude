# 🤖 智能体快速开始指南

> **适用人群**: 首次使用智能体的开发者  
> **阅读时间**: 5分钟  
> **上手时间**: 10分钟

---

## 📖 3分钟了解智能体

### 什么是智能体？

智能体是专门训练的AI助手，每个智能体负责开发流程中的特定任务。就像一个专业团队，每个成员都有自己的专长。

```
传统开发: 你 + AI助手（什么都做）
智能体开发: 你 + 10个专家（各司其职，自动协作）
```

### 为什么需要智能体？

| 对比项 | 传统AI助手 | 智能体团队 |
|--------|----------|-----------|
| 效率 | 1x | 2-6x |
| 质量 | 70分 | 95分 |
| 自动化率 | 30% | 90% |
| Token消耗 | 高 | 节省47% |

### 你有哪些智能体？

```
需求阶段:
📋 @requirements-analyst - 需求分析专家

开发阶段:
🏗️ @code-generator - 代码生成大师
🔍 @code-reviewer - 代码审查专家

测试阶段:
🧪 @test-engineer - 测试工程师
🐛 @bug-detective - Bug侦探

质量阶段:
✅ @quality-inspector - 质量检查专家

管理阶段:
📊 @project-manager - 项目经理

发布阶段:
🌿 @git-workflow-manager - Git管理专家
🚀 @release-manager - 版本发布专家
📦 @deployment-assistant - 部署助手
```

---

## 🎯 3个最常见使用场景

### 场景1: 我想开发一个新功能

**你说**:
```
帮我开发一个用户管理功能
```

**智能体自动工作流**:
```
步骤1: @requirements-analyst 自动激活
    ↓ 澄清需求（询问3-5个问题）
    
步骤2-5: 技术设计和数据库设计
    ↓ 生成设计方案
    
步骤6: @code-generator 自动激活
    ↓ 生成后端代码
    ↓ @code-reviewer 自动审查
    ↓ 发现问题自动修复
    
步骤7: 前端开发
    ↓ 生成Vue页面
    
步骤8: @test-engineer 自动激活
    ↓ 生成测试代码
    ↓ 运行测试
    
步骤9: @quality-inspector 自动激活
    ↓ 质量检查报告
    
步骤10-11: @project-manager + @git-workflow-manager
    ↓ 更新文档 + Git提交
    
✅ 完成！
```

**你只需要**:
- 回答需求澄清问题
- 验收最终效果

---

### 场景2: 代码审查

**你说**:
```
@code-reviewer 审查这段代码
```

**智能体工作**:
```
🔍 正在审查代码...

审查维度:
- 代码规范（CheckStyle）
- 潜在Bug（SpotBugs）
- 性能问题
- 安全漏洞
- 最佳实践

📊 审查结果:
Critical: 2个 → 自动修复建议
High: 3个 → 修复方案
Medium: 5个 → 优化建议

✅ 审查完成！综合评分: 85/100
```

---

### 场景3: 测试失败了

**你说**:
```
测试失败了，帮我定位问题
```

**智能体协作**:
```
@test-engineer: 开始定位...
    ↓ 失败用例: testUpdateUser
    ↓ 错误: NullPointerException
    ↓ 疑似原因: 用户不存在时未处理
    
@bug-detective: 深度分析...
    ↓ 5个为什么根因分析
    ↓ 根本原因: Service层缺少空值检查
    
    📝 修复方案:
    1. 在Service层添加空值检查
    2. 返回友好错误信息
    3. 补充测试用例
    
✅ 问题定位完成！是否应用修复？
```

---

## ⚙️ 智能体激活方式

### 方式1: 自动激活（推荐）⭐

当你使用开发流程时，智能体会自动激活，无需手动调用。

```
你: "帮我开发一个商品管理功能"

系统自动:
步骤1 → 激活 @requirements-analyst
步骤6 → 激活 @code-generator + @code-reviewer
步骤8 → 激活 @test-engineer
步骤9 → 激活 @quality-inspector
步骤10-11 → 激活 @project-manager + @git-workflow-manager
```

### 方式2: 显式激活

当你想单独使用某个智能体时：

```
@requirements-analyst 分析这个需求
@code-generator 生成代码
@test-engineer 生成测试代码
@quality-inspector 执行质量检查
@bug-detective 定位这个Bug
```

### 方式3: 关键词触发

智能体会识别关键词自动激活：

| 关键词 | 激活智能体 |
|--------|-----------|
| "需求分析"、"澄清需求" | @requirements-analyst |
| "生成代码"、"后端开发" | @code-generator |
| "代码审查"、"代码评审" | @code-reviewer |
| "运行测试"、"测试覆盖率" | @test-engineer |
| "质量检查"、"代码扫描" | @quality-inspector |
| "Bug定位"、"问题分析" | @bug-detective |

---

## 🎮 10个智能体详细介绍

### 📋 @requirements-analyst - 需求分析专家

**何时激活**: 步骤1（需求澄清）

**核心能力**:
- 智能需求提取
- 结构化提问（3-5个关键问题）
- 需求冲突检测
- 自动生成需求文档

**输出产物**:
- 需求清单（功能点、数据字段）
- 验收标准
- 业务规则

**效率提升**: 2x（30分钟 → 15分钟）

---

### 🏗️ @code-generator - 代码生成大师

**何时激活**: 步骤5.5-6（代码生成）

**核心能力**:
- 智能生成方式选择（若依生成器 vs AI生成）
- 四层架构代码生成（Entity/Mapper/Service/Controller）
- 代码质量自动检查
- Token优化（节省70%）

**输出产物**:
- 后端代码（标准CRUD）
- 业务逻辑代码
- 测试代码

**效率提升**: 4x（2小时 → 30分钟）

---

### 🧪 @test-engineer - 测试工程师

**何时激活**: 步骤8（测试验证）

**核心能力**:
- 单元测试代码生成
- 接口测试代码生成
- 自动执行测试（mvn test）
- 覆盖率报告生成
- 智能Bug定位

**输出产物**:
- 测试代码（Service、Controller层）
- 测试报告
- 覆盖率报告（>80%）

**效率提升**: 3x（1.5小时 → 30分钟）

---

### 🔍 @code-reviewer - 代码审查专家

**何时激活**: 步骤6后自动激活

**核心能力**:
- 自动代码审查（规范、性能、安全）
- Critical问题自动修复
- 增量审查支持
- 静态分析集成

**输出产物**:
- 审查报告（问题分级）
- 修复代码
- 综合评分

**效率提升**: 3x（30分钟 → 10分钟）

---

### ✅ @quality-inspector - 质量检查专家

**何时激活**: 步骤9（质量检查）

**核心能力**:
- 工具可用性自动检测
- 静态代码分析（CheckStyle、PMD、SpotBugs）
- 安全漏洞扫描
- 覆盖率整合

**输出产物**:
- 质量报告
- 问题清单
- 修复建议

**效率提升**: 6x（30分钟 → 5分钟）

---

### 🐛 @bug-detective - Bug侦探

**何时激活**: 测试失败或代码审查发现Critical问题

**核心能力**:
- 自动化Bug定位
- 5个为什么根因分析
- 多方案对比
- 预防措施建议

**输出产物**:
- Bug报告
- 修复代码
- 预防措施

**效率提升**: 6x（2小时 → 20分钟）

---

### 📊 @project-manager - 项目经理

**何时激活**: 步骤10（文档更新）

**核心能力**:
- 自动进度追踪
- 风险预警
- 质量数据整合
- 智能判断是否更新待办

**输出产物**:
- 项目报告
- 风险分析
- 质量指标

**效率提升**: 5x（15分钟 → 3分钟）

---

### 🌿 @git-workflow-manager - Git管理专家

**何时激活**: 步骤3（Git初始化）和步骤11（提交）

**核心能力**:
- 智能提交信息生成
- 敏感信息检测
- PR自动创建
- 合并冲突检测

**输出产物**:
- 功能分支
- 提交信息
- Pull Request

**效率提升**: 20x（10分钟 → 30秒）

**快速参考**: [QUICK-REFERENCE.md](./git-workflow-manager/QUICK-REFERENCE.md)

---

### 🚀 @release-manager - 版本发布专家

**何时激活**: 步骤12（版本发布）

**核心能力**:
- 语义化版本自动计算
- CHANGELOG自动生成
- 用户友好发布说明
- GitHub Release创建

**输出产物**:
- 版本号（v1.2.3）
- CHANGELOG.md
- Release Notes

**效率提升**: 30x（30分钟 → 1分钟）

**快速参考**: [QUICK-REFERENCE.md](./release-manager/QUICK-REFERENCE.md)

---

### 📦 @deployment-assistant - 部署助手

**何时激活**: 步骤13（部署准备）

**核心能力**:
- 部署脚本自动生成
- 环境检查清单
- 交付文档整理
- 监控配置生成

**输出产物**:
- 部署脚本（Docker/K8s）
- 交付文档包
- 监控配置

**效率提升**: 30x（60分钟 → 2分钟）

**快速参考**: [QUICK-REFERENCE.md](./deployment-assistant/QUICK-REFERENCE.md)

---

## ⚡ Token优化技巧

### 技巧1: 让智能体自动协作

不要手动切换智能体，让它们自动协作。

**❌ 低效方式**:
```
@code-generator 生成代码
... 等待生成 ...
@code-reviewer 审查代码
```

**✅ 高效方式**:
```
帮我开发XXX功能  # 智能体自动协作
```

**节省**: 避免重复上下文加载，节省30% Token

---

### 技巧2: 使用代码生成器

步骤5.5选择若依代码生成器。

**节省**: 单个模块节省 70% Token（5000 → 1500）

---

### 技巧3: 精准激活智能体

只在必要时激活特定智能体。

```
# 仅需代码审查
@code-reviewer 审查这段代码

# 仅需Bug定位
@bug-detective 定位这个问题
```

**节省**: 避免执行完整流程，节省50% Token

---

## 🐛 常见问题速查

### Q1: 智能体没有自动激活？

**原因**:
- 可能关键词不明确
- 可能不在对应的工作流步骤

**解决**:
```
# 方式1: 显式激活
@requirements-analyst 分析需求

# 方式2: 使用关键词
"帮我开发XXX功能"  # 会自动激活
```

---

### Q2: 如何查看某个智能体的详细文档？

**位置**:
```
所有智能体详细文档:
.claude/agents/[智能体名称]/AGENT.md

快速参考（部分智能体）:
.claude/agents/[智能体名称]/QUICK-REFERENCE.md

示例:
- .claude/agents/requirements-analyst/AGENT.md
- .claude/agents/git-workflow-manager/QUICK-REFERENCE.md
```

---

### Q3: 智能体可以单独使用吗？

可以！智能体既可以自动协作，也可以单独使用。

**单独使用示例**:
```
@code-reviewer 审查这段代码
@test-engineer 生成测试代码
@bug-detective 定位这个Bug
@quality-inspector 执行质量检查
```

---

### Q4: 多个智能体协作失败怎么办？

**排查步骤**:
1. 查看错误信息
2. 检查上一个智能体的输出是否正常
3. 尝试单独激活失败的智能体
4. 查看 [主文档](./README.md) 的故障排查部分

---

### Q5: 如何知道智能体在做什么？

智能体会显示标注：

```
> [激活智能体: @code-generator] 正在生成代码...
> [激活智能体: @test-engineer] 正在运行测试...
> [激活智能体: @quality-inspector] 正在执行质量检查...
```

---

## 📚 学习路径

### 新手路径（第1-3个模块）

```
第1个模块:
✓ 读完本文档（5分钟）
✓ 使用场景1开发一个简单CRUD
✓ 观察智能体自动协作过程
✓ 体验自动化开发

第2个模块:
✓ 尝试单独激活智能体
✓ 使用@code-reviewer审查代码
✓ 使用@test-engineer生成测试

第3个模块:
✓ 完整走完12步流程
✓ 观察所有智能体协作
✓ 查看质量报告和覆盖率
```

### 进阶路径（第4-10个模块）

```
✓ 阅读各智能体的AGENT.md
✓ 学习Token优化技巧
✓ 尝试复杂业务逻辑开发
✓ 使用发布交付智能体（步骤12-13）
```

---

## 🎓 完整文档索引

### 核心文档（必读）
- **[当前文档](./QUICK-START.md)** - 智能体快速开始 ← 你在这里
- **[智能体主索引](./README.md)** - 完整智能体列表和协作关系
- **[开发流程](../commands/dev.md)** - 12步标准开发流程
- **[快速开始](../commands/QUICK-START.md)** - 开发流程快速上手

### 智能体详细文档（按需查阅）
- **需求分析**: [requirements-analyst/AGENT.md](./requirements-analyst/AGENT.md)
- **代码生成**: [code-generator/AGENT.md](./code-generator/AGENT.md)
- **测试工程**: [test-engineer/AGENT.md](./test-engineer/AGENT.md)
- **代码审查**: [code-reviewer/AGENT.md](./code-reviewer/AGENT.md)
- **质量检查**: [quality-inspector/AGENT.md](./quality-inspector/AGENT.md)
- **Bug定位**: [bug-detective/AGENT.md](./bug-detective/AGENT.md)
- **项目管理**: [project-manager/AGENT.md](./project-manager/AGENT.md)
- **Git管理**: [git-workflow-manager/QUICK-REFERENCE.md](./git-workflow-manager/QUICK-REFERENCE.md)
- **版本发布**: [release-manager/QUICK-REFERENCE.md](./release-manager/QUICK-REFERENCE.md)
- **部署助手**: [deployment-assistant/QUICK-REFERENCE.md](./deployment-assistant/QUICK-REFERENCE.md)

### 历史文档（了解演进）
- **[归档说明](./archives/README.md)** - 各阶段开发历史

---

## 💬 获取帮助

### 遇到问题时

1. **先自助**: 查看本文档的常见问题
2. **查主文档**: [README.md](./README.md) 的故障排查部分
3. **直接问AI**: 描述问题，AI会引导你解决

### 反馈与改进

```
直接告诉AI: "我觉得XX智能体可以改进为XX"
AI会记录并在合适时更新文档
```

---

## 🎉 开始使用智能体吧！

现在你已经了解了智能体的基本使用方法，直接开始你的第一次开发：

```
帮我开发一个【XXX】模块
```

智能体团队会自动协作完成！

---

**最后提醒**:
- ⚡ 让智能体自动协作，不要手动切换
- 🎯 使用代码生成器可节省70% Token
- 📚 遇到问题先看FAQ，90%都有答案
- 🤖 智能体会自动显示工作状态

**祝你开发愉快！** 🚀
