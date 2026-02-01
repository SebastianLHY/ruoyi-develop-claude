# @git-workflow-manager 快速参考卡片

> **一句话**: Git提交全自动化，从进度报告到PR创建

---

## 🚀 快速激活

```bash
@git-workflow-manager
```

**前置条件**:
- ✅ 步骤10已完成（进度报告）
- ✅ 步骤9已完成（质量报告）
- ✅ 步骤8已完成（测试报告）

---

## 📊 核心功能（4个）

### 1. 智能提交信息生成
- **输入**: 进度报告 + 质量指标 + 覆盖率数据
- **输出**: 规范的commit message（约定式提交）
- **时间**: 10秒
- **格式**:
  ```
  feat(sport): 新增运动记录管理功能
  
  - 实现运动记录的增删改查
  - 添加运动统计分析功能
  
  测试覆盖率: 85%
  代码质量: B+
  ```

### 2. 敏感信息自动检测
- **检测**: 密钥文件 + 硬编码密码 + 敏感关键词
- **阻止**: 发现敏感信息立即阻止提交
- **时间**: 5秒
- **示例**:
  ```
  ❌ 检测到敏感信息
  位置: application.yml:15
  内容: password=root123
  → 修复后才能提交
  ```

### 3. 自动PR创建
- **工具**: GitHub CLI (gh) / GitLab CLI (glab)
- **内容**: 完整质量指标 + 功能说明 + 审查重点
- **时间**: 30秒
- **输出**:
  ```
  ✅ PR创建完成
  PR链接: https://github.com/org/repo/pull/123
  ```

### 4. 冲突提前检测
- **检测**: 尝试合并main分支
- **报告**: 冲突文件列表 + 解决建议
- **时间**: 10秒
- **处理**: 提前发现问题，避免合并时冲突

---

## 🎯 常用命令

| 命令 | 说明 | 使用场景 |
|------|------|---------|
| `@git-workflow-manager` | 标准提交 | 功能开发完成 ✅ |
| `@git-workflow-manager --urgent` | 紧急提交（跳过部分检查） | 紧急Bug修复 🔥 |
| `@git-workflow-manager --check-only` | 仅检测敏感信息 | 提交前检查 🔍 |
| `@git-workflow-manager --pr-only` | 仅创建PR（不提交） | 代码已手动提交 📝 |
| `@git-workflow-manager --skip-confirm` | 跳过所有确认 | 快速模式 ⚡ |

---

## 🔄 工作流程（6步）

```
[1] 整合数据
    ↓ 进度报告 + 质量报告 + 测试报告
[2] 生成提交信息
    ↓ 约定式提交格式
[3] 敏感信息检测
    ↓ 密钥/密码/关键词
    ├─ 通过 ✅
    └─ 失败 ❌ → 阻止提交
[4] 执行Git提交
    ↓ git add + git commit
[5] 推送到远程
    ↓ git push origin [branch]
[6] 创建PR/MR
    ↓ gh pr create
✅ 完成
```

**总耗时**: ~2分钟

---

## ⚠️ 常见问题

### ❌ 问题1: 提交信息生成失败

**现象**:
```
❌ [Git工作流管理] 提交信息生成失败
错误: 无法获取进度报告
```

**原因**: 步骤10未完成

**解决**:
```bash
# 1. 检查进度报告是否存在
ls docs/开发进度报告.md

# 2. 手动激活项目管理器
@project-manager

# 3. 重新执行步骤11
@git-workflow-manager
```

---

### ⚠️ 问题2: 敏感信息检测误报

**现象**:
```
⚠️ 检测到敏感信息: test-password
位置: src/test/resources/application-test.yml
```

**原因**: 测试配置文件中的密码被识别

**解决方案**:

**方案A: 添加到 .gitignore（推荐）**
```bash
echo "src/test/resources/application-test.yml" >> .gitignore
```

**方案B: 使用明显的测试密码**
```yaml
# application-test.yml
spring:
  datasource:
    password: test-password-not-real  # 明显不是真实密码
```

**方案C: 使用环境变量**
```yaml
spring:
  datasource:
    password: ${TEST_DB_PASSWORD:test}
```

---

### ❌ 问题3: PR创建失败

**现象**:
```
❌ PR创建失败
错误: GitHub API限流
```

**原因**: GitHub API调用次数超限

**解决**:
```bash
# 1. 检查API限流状态
gh api rate_limit

# 2. 等待限流重置（通常1小时）
# 或

# 3. 手动创建PR
gh pr create \
  --title "feat(sport): 新增运动记录管理" \
  --body "详见提交信息"
```

---

### ⚠️ 问题4: 检测到合并冲突

**现象**:
```
❌ 检测到合并冲突
冲突文件: SportRecord.java, pom.xml
```

**原因**: 同时修改了相同文件

**解决**:
```bash
# 1. 在功能分支解决冲突
git checkout feature/sport-record
git merge main

# 2. 手动编辑冲突文件
# 解决冲突标记 <<<<<<<, =======, >>>>>>>

# 3. 标记为已解决
git add SportRecord.java pom.xml

# 4. 提交合并
git commit -m "merge: 解决与main的合并冲突"

# 5. 重新执行步骤11
@git-workflow-manager
```

---

### ❓ 问题5: 如何自定义提交信息？

**默认生成**:
```
feat(sport): 新增运动记录管理功能

- 实现运动记录的增删改查
- 添加运动统计分析功能

测试覆盖率: 85%
代码质量: B+
```

**自定义方式**:

**方式A: 提交前修改**
```bash
# 1. 智能体生成后，会提示确认
确认提交？[是/否]

# 2. 选择"否"，手动修改
git commit --amend

# 3. 重新执行
@git-workflow-manager --skip-commit
```

**方式B: 手动指定**
```bash
# 提供自定义信息
@git-workflow-manager --message "feat(sport): 自定义提交信息"
```

---

## 📊 效果对比

| 指标 | 手动方式 | 使用智能体 | 提升 |
|-----|---------|-----------|------|
| 提交信息编写 | 10分钟 | 30秒 | 20x ↑ |
| 敏感信息检测 | 5分钟 | 10秒 | 30x ↑ |
| PR创建 | 5分钟 | 30秒 | 10x ↑ |
| 冲突检测 | 10分钟 | 30秒 | 20x ↑ |
| **总耗时** | **30分钟** | **2分钟** | **15x ↑** |
| **规范性** | 60% | 100% | +40% |
| **泄露率** | 5% | 0% | ↓100% |

---

## 🎯 最佳实践

### ✅ 推荐做法

1. **按流程执行**: 确保步骤8-10已完成
2. **信任检测**: 敏感信息检测失败时，必须修复
3. **及时推送**: 提交后立即推送，避免冲突
4. **查看PR**: 创建后检查PR内容是否准确

### ❌ 避免做法

1. **跳过步骤**: 不要在步骤10前执行步骤11
2. **忽略警告**: 敏感信息检测不可跳过
3. **手动修改**: 不要在智能体执行中手动操作Git
4. **强制推送**: 避免使用 `git push --force`

---

## 🔗 相关资源

### 文档链接
- 📄 [完整AGENT.md](./AGENT.md) - 详细功能说明
- 🔧 [故障排查指南](./AGENT.md#故障排查) - 更多问题解决
- 📚 [开发流程](../../commands/dev-steps.md) - 完整开发流程
- 🔄 [回滚指南](../../commands/dev-rollback-guide.md) - 失败回滚

### 外部参考
- [约定式提交](https://www.conventionalcommits.org/zh-hans/)
- [GitHub CLI](https://cli.github.com/)
- [GitLab CLI](https://glab.readthedocs.io/)
- [OWASP 密钥管理](https://owasp.org/)

---

## 💡 快速提示

### 提交前检查清单
- [ ] 代码已完成并测试通过
- [ ] 步骤8-10已完成
- [ ] 工作区无未暂存文件
- [ ] 无敏感信息（密码、密钥）
- [ ] 提交信息准确描述变更

### 敏感信息快速检查
```bash
# 检查是否有敏感文件
find . -name "*.key" -o -name "*.pem" -o -name ".env"

# 检查是否有硬编码密码
grep -r "password\s*=" --include="*.yml" --include="*.properties"

# 检查是否有API密钥
grep -r "apiKey\|accessKey\|secretKey" --include="*.java"
```

### PR模板快速参考
```markdown
## 功能说明
[简短描述]

## 完成内容
- [x] 功能1
- [x] 功能2

## 质量指标
- 测试覆盖率: XX%
- 代码质量: XX

## 审查重点
- [ ] 业务逻辑
- [ ] 权限控制
```

---

## 📞 获取帮助

遇到问题？

1. **查看详细文档**: [AGENT.md](./AGENT.md)
2. **搜索常见问题**: 本文档"常见问题"章节
3. **查看回滚指南**: [dev-rollback-guide.md](../../commands/dev-rollback-guide.md)
4. **向团队反馈**: 联系项目维护者

---

**快速参考版本**: v1.0  
**创建时间**: 2026-01-29  
**适用智能体版本**: @git-workflow-manager v1.0.0+  
**维护者**: AI 开发团队

---

**提示**: 这是快速参考卡片，详细说明请查看 [完整AGENT.md](./AGENT.md)
