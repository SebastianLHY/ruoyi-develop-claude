---
name: git-workflow
description: |
  基于若依-vue-plus框架的Git版本控制标准，定义团队协作中的完整工作流规范。
  涵盖分支管理策略、提交信息规范、代码审查流程、冲突解决方案及版本发布规范，确保多分支并行开发的代码质量与可追溯性。
  
  触发场景：
  - 开始新功能开发前需要创建分支
  - 修复线上Bug或紧急问题
  - 提交代码时需要遵循规范
  - 合并代码前需要进行审查
  - 版本发布或标签创建时
  - 处理代码冲突或回滚操作
  
  触发词：Git工作流、分支管理、提交规范、代码合并、版本发布、代码审查、冲突解决、代码回滚
---

# Git 工作流规范

## 核心规范

### 规范1：分支管理策略（Git Flow Workflow）

**详细说明：**
采用标准的 Git Flow 分支模型，确保生产环境稳定性与开发灵活性：

**分支类型与用途：**
- `Master/Main`（生产分支）：仅包含已发布到生产环境的稳定代码，每次合并必须打标签（Tag）
- `Dev/Develop`（开发分支）：集成分支，所有功能开发完成后合并至此进行集成测试
- `Feature/*`（功能分支）：单个功能或需求的开发分支，命名格式：`feature/模块名-功能描述`
- `Hotfix/*`（热修复分支）：紧急修复线上Bug，从`Master`切出，修复后合并回`Master`和`Dev`
- `Release/*`（发布分支）：版本发布准备分支，从`Dev`切出，仅允许修复Bug和调整配置

**分支生命周期：**
```bash
# ============================================
# 场景1：开始新功能开发
# ============================================
# 步骤1: 确保本地Dev分支是最新的
git checkout dev
git pull origin dev

# 步骤2: 从Dev切出功能分支（命名规范：feature/模块-功能）
git checkout -b feature/system-dept-export

# 步骤3: 开发过程中定期提交（参考规范2的提交信息规范）
git add src/views/system/dept/export.vue
git commit -m "feat(system): 新增部门导出Excel功能"

# 步骤4: 定期同步Dev分支的最新代码（避免分支偏离）
git fetch origin dev
git rebase origin/dev  # 或使用 git merge origin/dev

# 步骤5: 推送到远程仓库
git push origin feature/system-dept-export

# 步骤6: 在GitLab/Gitee上创建Merge Request（MR）
# 目标分支：dev
# 必须指定至少1名审查人
# 必须通过CI/CD检查（如有配置）

# ============================================
# 场景2：紧急修复线上Bug（Hotfix流程）
# ============================================
# 步骤1: 从Master切出热修复分支
git checkout master
git pull origin master
git checkout -b hotfix/fix-login-timeout

# 步骤2: 修复Bug并提交
git add src/api/login.js
git commit -m "fix(auth): 修复登录超时导致的Token失效问题"

# 步骤3: 合并回Master（需要PR审查）
git checkout master
git merge --no-ff hotfix/fix-login-timeout
git tag -a v1.2.1 -m "紧急修复：登录超时问题"
git push origin master --tags

# 步骤4: 同步到Dev分支
git checkout dev
git merge --no-ff hotfix/fix-login-timeout
git push origin dev

# 步骤5: 删除热修复分支
git branch -d hotfix/fix-login-timeout
git push origin --delete hotfix/fix-login-timeout

# ============================================
# 场景3：版本发布流程（Release流程）
# ============================================
# 步骤1: 从Dev切出发布分支
git checkout dev
git pull origin dev
git checkout -b release/v1.3.0

# 步骤2: 更新版本号并进行最后的Bug修复
# 修改 pom.xml 或 package.json 中的版本号
git add pom.xml
git commit -m "chore(release): 升级版本号至v1.3.0"

# 步骤3: 合并到Master并打标签
git checkout master
git merge --no-ff release/v1.3.0
git tag -a v1.3.0 -m "发布版本v1.3.0 - 新增部门管理导出功能"
git push origin master --tags

# 步骤4: 合并回Dev保持同步
git checkout dev
git merge --no-ff release/v1.3.0
git push origin dev

# 步骤5: 删除发布分支
git branch -d release/v1.3.0
git push origin --delete release/v1.3.0
```

### 规范2：提交信息规范（Conventional Commits）

**详细说明：**
严格遵循 `Conventional Commits` 规范，确保提交历史清晰可读，便于自动生成变更日志（Changelog）和语义化版本控制。

**提交格式：**
```
<type>(<scope>): <subject>

<body>（可选）

<footer>（可选）
```

**Type 类型定义（必选）：**
- `feat`: 新增功能（Feature）
- `fix`: 修复Bug
- `docs`: 文档变更（README、注释等）
- `style`: 代码格式调整（不影响逻辑，如空格、分号等）
- `refactor`: 重构代码（既不是新增功能也不是修复Bug）
- `perf`: 性能优化
- `test`: 新增或修改测试代码
- `chore`: 构建过程或辅助工具的变动（如依赖更新、配置修改）
- `revert`: 回滚之前的提交

**Scope 范围（推荐）：**
- 模块名称，如：`system`（系统管理）、`monitor`（系统监控）、`common`（公共模块）、`auth`（认证授权）
- 前端可细化到组件级别：`user-dialog`、`dept-tree`

**Subject 主题（必选）：**
- 使用中文简洁描述本次提交做了什么（不超过50字）
- 使用祈使句，如"新增"而非"新增了"
- 不加句号或其他标点符号结尾

**示例代码：**
```bash
# ============================================
# ✅ 正确示例
# ============================================

# 示例1: 新增功能（完整格式）
git commit -m "feat(system): 新增用户批量导入Excel功能

支持上传.xlsx和.xls格式文件，自动校验手机号、邮箱格式，
失败数据支持下载错误报告。"

# 示例2: 修复Bug（简洁格式）
git commit -m "fix(auth): 修复登录Token过期后未正确跳转登录页的问题"

# 示例3: 性能优化
git commit -m "perf(system): 优化部门树查询性能，减少数据库递归查询次数"

# 示例4: 重构代码
git commit -m "refactor(common): 抽取StringUtils公共方法，统一空值判断逻辑"

# 示例5: 文档更新
git commit -m "docs(README): 更新项目部署文档，补充Redis配置说明"

# 示例6: 依赖更新
git commit -m "chore(deps): 升级Vue版本至3.4.0，修复已知安全漏洞"

# 示例7: 回滚提交
git commit -m "revert: 回滚feat(system): 新增用户导入功能

因发现性能问题，暂时回滚该功能，待优化后重新提交。

This reverts commit a1b2c3d4."

# ============================================
# ❌ 错误示例（严禁使用）
# ============================================

# 错误1: 信息过于模糊
# git commit -m "update code"
# git commit -m "修复bug"
# git commit -m "优化"

# 错误2: 缺少type前缀
# git commit -m "修复登录问题"

# 错误3: scope不规范
# git commit -m "feat(aaa): 新增功能"

# 错误4: 使用过去式
# git commit -m "feat(system): 新增了用户导出功能"

# ============================================
# 工具配置：commitlint强制校验
# ============================================
# 在前端项目根目录安装commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# 创建 commitlint.config.js 配置文件
cat > commitlint.config.js << EOF
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert']
    ],
    'subject-max-length': [2, 'always', 100],
    'subject-case': [0]  // 允许中文主题
  }
};
EOF

# 配置husky在commit前自动校验
npm install --save-dev husky
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### 规范3：代码审查流程（Code Review）

**详细说明：**
所有代码合并到 `Dev` 或 `Master` 分支前，必须经过至少1名团队成员的代码审查，确保代码质量和知识共享。

**审查重点：**
1. **功能正确性**：代码是否实现了需求，逻辑是否正确
2. **代码规范**：是否符合团队编码规范（Java规范、Vue规范等）
3. **性能考虑**：是否存在明显的性能问题（N+1查询、大循环等）
4. **安全性**：是否存在SQL注入、XSS、敏感信息泄露等安全隐患
5. **可维护性**：代码是否清晰易懂，是否有必要的注释
6. **测试覆盖**：是否有单元测试或功能测试

**审查流程：**
```bash
# ============================================
# 场景：提交Merge Request后的审查流程
# ============================================

# 步骤1: 开发者在GitLab/Gitee上创建MR
# - 标题：feat(system): 新增用户导出功能
# - 描述：详细说明本次改动的背景、实现方案、测试情况
# - 指定审查人：@zhangsan @lisi
# - 关联需求：#123

# 步骤2: 审查人收到通知后进行审查
# 2.1 在线查看代码差异
# 2.2 针对问题代码添加评论
# 2.3 如果发现问题，标记为"需要修改"并说明原因

# 步骤3: 开发者根据反馈修改代码
git add src/views/system/user/export.vue
git commit -m "fix(system): 根据CR反馈优化导出逻辑，添加进度提示"
git push origin feature/system-user-export

# 步骤4: 审查人确认修改后，批准MR
# 步骤5: 开发者或项目负责人执行合并操作

# ============================================
# 审查清单（Reviewer检查项）
# ============================================
# [ ] 代码是否符合团队编码规范
# [ ] 是否存在硬编码的配置信息（应使用配置文件）
# [ ] 异常处理是否完善（try-catch、全局异常处理）
# [ ] 日志输出是否合理（INFO/WARN/ERROR级别使用正确）
# [ ] 数据库操作是否使用了事务（@Transactional）
# [ ] 前端组件是否合理拆分，是否存在过大的单文件组件
# [ ] API接口是否符合RESTful规范
# [ ] 是否有必要的权限校验（@PreAuthorize）
```

### 规范4：冲突解决策略

**详细说明：**
在多人协作开发中，代码冲突不可避免。正确处理冲突是保证代码质量的关键。

**冲突预防：**
1. 定期同步主分支代码（至少每天一次）
2. 功能分支生命周期不超过3天
3. 及时合并已完成的功能分支

**冲突解决流程：**
```bash
# ============================================
# 场景1：在功能分支开发期间同步主分支代码
# ============================================
# 步骤1: 切换到功能分支
git checkout feature/system-user-export

# 步骤2: 获取最新的远程分支信息
git fetch origin

# 步骤3: 变基到最新的dev分支（推荐方式，保持提交历史整洁）
git rebase origin/dev

# 如果出现冲突，Git会暂停并提示冲突文件
# 步骤4: 手动解决冲突（在IDE中打开冲突文件）
# <<<<<<< HEAD
# 你的代码
# =======
# dev分支的代码
# >>>>>>> origin/dev

# 步骤5: 标记冲突已解决
git add src/views/system/user/export.vue

# 步骤6: 继续变基
git rebase --continue

# 步骤7: 强制推送到远程（因为变基改变了提交历史）
git push origin feature/system-user-export --force-with-lease

# ============================================
# 场景2：使用merge方式解决冲突（不推荐，但更安全）
# ============================================
# 步骤1-2: 同上
git checkout feature/system-user-export
git fetch origin

# 步骤3: 合并dev分支到当前分支
git merge origin/dev

# 步骤4-5: 解决冲突并提交
git add src/views/system/user/export.vue
git commit -m "merge: 合并dev分支，解决导出功能冲突"

# 步骤6: 推送到远程
git push origin feature/system-user-export

# ============================================
# 场景3：合并请求时发现冲突
# ============================================
# GitLab/Gitee会提示冲突，需要在本地解决后重新推送
git checkout feature/system-user-export
git fetch origin
git merge origin/dev  # 或 git rebase origin/dev
# 解决冲突后推送
git push origin feature/system-user-export

# ============================================
# 冲突解决原则
# ============================================
# 1. 优先与冲突代码的作者沟通，了解其修改意图
# 2. 不确定时保留双方代码，再进行整合
# 3. 解决冲突后必须重新测试功能
# 4. 重大冲突解决后建议进行额外的Code Review
```

### 规范5：版本标签管理

**详细说明：**
使用语义化版本号（Semantic Versioning）规范进行版本管理，格式为：`v主版本号.次版本号.修订号`

**版本号规则：**
- **主版本号（Major）**：不兼容的API修改或重大架构调整（v1.0.0 → v2.0.0）
- **次版本号（Minor）**：向后兼容的功能性新增（v1.2.0 → v1.3.0）
- **修订号（Patch）**：向后兼容的问题修正（v1.2.3 → v1.2.4）

**标签操作：**
```bash
# ============================================
# 创建标签
# ============================================
# 轻量标签（不推荐）
git tag v1.3.0

# 附注标签（推荐，包含详细信息）
git tag -a v1.3.0 -m "发布版本v1.3.0

新功能：
- 新增用户批量导入功能
- 新增部门树导出Excel功能

Bug修复：
- 修复角色权限校验问题
- 修复登录Token过期问题

优化：
- 优化部门树查询性能"

# 推送标签到远程
git push origin v1.3.0

# 推送所有标签
git push origin --tags

# ============================================
# 查看标签
# ============================================
# 查看所有标签
git tag

# 查看特定标签的详细信息
git show v1.3.0

# 查看标签对应的提交
git log v1.3.0

# ============================================
# 删除标签
# ============================================
# 删除本地标签
git tag -d v1.3.0

# 删除远程标签
git push origin --delete v1.3.0

# ============================================
# 基于标签创建分支（用于修复已发布版本的Bug）
# ============================================
git checkout -b hotfix/v1.3.1 v1.3.0
```

### 规范6：代码回滚策略

**详细说明：**
当发现已合并的代码存在严重问题时，需要快速回滚，确保主分支稳定性。

**回滚方式选择：**
1. **git revert**（推荐）：创建新提交来撤销之前的修改，保留历史记录
2. **git reset**（谨慎使用）：直接删除提交记录，会改变历史

**回滚操作：**
```bash
# ============================================
# 方式1：使用revert回滚（推荐，安全）
# ============================================
# 场景：回滚最近一次提交
git revert HEAD
# Git会创建一个新提交，撤销HEAD的修改

# 场景：回滚指定的提交
git log --oneline  # 查看提交历史，找到要回滚的commit ID
git revert a1b2c3d4

# 场景：回滚多个连续提交
git revert HEAD~3..HEAD  # 回滚最近3次提交

# 场景：回滚合并提交（Merge Commit）
git revert -m 1 abc123  # -m 1 表示保留主分支的代码

# 推送到远程
git push origin dev

# ============================================
# 方式2：使用reset回滚（危险，仅本地使用）
# ============================================
# ⚠️ 警告：reset会删除提交历史，仅在本地未推送时使用

# 场景：撤销最近一次提交，保留修改内容
git reset --soft HEAD~1

# 场景：撤销最近一次提交，不保留修改内容
git reset --hard HEAD~1

# 场景：回滚到指定提交
git reset --hard a1b2c3d4

# ============================================
# 方式3：紧急回滚已发布版本
# ============================================
# 场景：发现生产环境存在严重Bug，需要立即回滚到上一个版本

# 步骤1: 查看标签历史
git tag

# 步骤2: 创建hotfix分支从上一个稳定版本
git checkout -b hotfix/rollback-to-v1.2.0 v1.2.0

# 步骤3: 合并回Master
git checkout master
git merge --no-ff hotfix/rollback-to-v1.2.0
git tag -a v1.2.1 -m "紧急回滚：回退至v1.2.0版本"
git push origin master --tags

# 步骤4: 同步到Dev
git checkout dev
git merge --no-ff hotfix/rollback-to-v1.2.0
git push origin dev
```

## 禁止事项

### 分支管理禁止项
- ❌ 禁止直接向 `Master` 或 `Main` 分支 Push 代码（必须走 PR/MR 流程）
- ❌ 禁止在生产分支上直接修改代码（必须通过 Hotfix 分支）
- ❌ 禁止功能分支存活时间超过5天（应及时合并或重新评估需求）
- ❌ 禁止在功能分支上进行与该功能无关的修改（保持分支职责单一）
- ❌ 禁止删除远程主分支（Master、Dev）

### 提交规范禁止项
- ❌ 禁止使用模糊的提交信息（如 "update"、"fix bug"、"修改"）
- ❌ 禁止一次提交包含多个不相关的修改（应拆分为多个提交）
- ❌ 禁止提交未经测试的代码（至少保证本地编译通过）
- ❌ 禁止提交带有敏感信息的代码（如数据库密码、AccessKey、私钥、`application-prod.yml`）
- ❌ 禁止提交编译产物（如 `.class`、`target/`、`dist/`、`node_modules/`、`.DS_Store`）
- ❌ 禁止提交 IDE 配置文件（如 `.idea/`、`.vscode/`，除非团队统一使用）
- ❌ 禁止使用 `git add .` 而不检查暂存内容（应使用 `git add -p` 或分文件添加）

### 代码审查禁止项
- ❌ 禁止在未经审查的情况下自行合并代码（即使是紧急修复）
- ❌ 禁止审查流于形式（直接点击批准而不认真查看代码）
- ❌ 禁止在审查中发现问题后不记录就口头通知（必须在MR中留下评论）
- ❌ 禁止审查反馈过于主观（应基于团队规范和最佳实践）

### 冲突解决禁止项
- ❌ 禁止在不理解冲突原因的情况下随意选择一方代码
- ❌ 禁止合并代码时不解决冲突（残留 `<<<<<<<`、`=======`、`>>>>>>>` 标记）
- ❌ 禁止解决冲突后不重新测试功能
- ❌ 禁止使用 `git push --force` 强制推送到共享分支（可使用 `--force-with-lease`）

### 版本发布禁止项
- ❌ 禁止发布未经测试的版本
- ❌ 禁止在 Release 分支上添加新功能（仅允许Bug修复）
- ❌ 禁止跳过版本号（如 v1.2.0 直接到 v1.4.0）
- ❌ 禁止在发布后不打标签（Tag）

### 回滚操作禁止项
- ❌ 禁止在共享分支上使用 `git reset --hard`（会导致他人代码丢失）
- ❌ 禁止回滚后不通知团队成员
- ❌ 禁止在不理解回滚原因的情况下执行回滚操作

## 参考文件

### 配置文件
- `.gitignore`（项目根目录）：忽略文件配置
- `pom.xml`（后端根目录）：Maven版本号管理
- `package.json`（前端根目录）：npm版本号管理
- `commitlint.config.js`（前端根目录）：提交信息校验配置
- `.husky/commit-msg`（前端根目录）：Git hooks配置

### 示例 `.gitignore` 文件
```gitignore
# 编译产物
target/
dist/
build/
*.class
*.jar
*.war

# 依赖目录
node_modules/
.pnp/

# IDE配置
.idea/
.vscode/
*.iml
.DS_Store

# 日志文件
logs/
*.log

# 环境配置（敏感信息）
application-prod.yml
application-prod.properties
.env
.env.local
.env.production

# 临时文件
tmp/
temp/
*.tmp
*.bak
```

### 示例 `commitlint.config.js` 文件
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type类型枚举
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert']
    ],
    // 主题最大长度
    'subject-max-length': [2, 'always', 100],
    // 允许中文主题
    'subject-case': [0],
    // Scope必须小写
    'scope-case': [2, 'always', 'lower-case'],
    // 主题不能为空
    'subject-empty': [2, 'never'],
    // Type不能为空
    'type-empty': [2, 'never']
  }
};
```

## 操作检查清单

### 开始新功能开发前
- [ ] 是否从最新的 `Dev` 分支切出功能分支
- [ ] 分支命名是否符合 `feature/模块-功能` 格式
- [ ] 是否已理解需求并制定开发计划

### 代码提交前
- [ ] 是否已在本地测试功能正常
- [ ] 提交信息是否遵循 `type(scope): subject` 格式
- [ ] 是否检查了暂存区内容（`git diff --staged`）
- [ ] 是否已排除敏感信息和编译产物
- [ ] 是否已检查代码格式（Prettier、ESLint）

### 创建合并请求前
- [ ] 是否已同步最新的目标分支代码
- [ ] 是否已解决所有代码冲突
- [ ] 是否已通过本地单元测试
- [ ] 是否填写了详细的 MR 描述（背景、实现方案、测试情况）
- [ ] 是否指定了合适的审查人

### 代码审查时
- [ ] 是否检查了代码规范
- [ ] 是否检查了异常处理和日志输出
- [ ] 是否检查了性能问题（N+1查询、大循环）
- [ ] 是否检查了安全隐患（SQL注入、XSS）
- [ ] 是否检查了权限校验
- [ ] 是否给出了建设性的反馈意见

### 版本发布前
- [ ] 是否更新了版本号（`pom.xml`、`package.json`）
- [ ] 是否已完成完整的功能测试
- [ ] 是否已准备好变更日志（Changelog）
- [ ] 是否已通知相关人员发布计划
- [ ] 是否已确认数据库脚本和配置文件

### 版本发布后
- [ ] 是否已打标签（Tag）并推送到远程
- [ ] 是否已合并回 `Dev` 分支保持同步
- [ ] 是否已删除临时分支（`Release`、`Hotfix`）
- [ ] 是否已更新项目文档
- [ ] 是否已进行发布后验证

## 常见问题与解决方案

### Q1: 如何修改最近一次提交的信息？
```bash
# 修改最近一次提交的message
git commit --amend -m "feat(system): 新的提交信息"

# 如果已经推送到远程，需要强制推送
git push origin feature/xxx --force-with-lease
```

### Q2: 如何合并多个提交为一个？
```bash
# 交互式变基，合并最近3次提交
git rebase -i HEAD~3

# 在编辑器中，将后面的 pick 改为 squash（或 s）
# 保存后会提示输入新的提交信息
```

### Q3: 如何查看某个文件的修改历史？
```bash
# 查看文件的提交历史
git log --follow -- src/views/system/user/index.vue

# 查看文件每一行的修改记录
git blame src/views/system/user/index.vue
```

### Q4: 如何暂存当前工作切换分支？
```bash
# 暂存当前修改
git stash save "暂存功能开发中的代码"

# 切换到其他分支处理紧急问题
git checkout master

# 处理完毕后，恢复暂存的修改
git checkout feature/xxx
git stash pop
```

### Q5: 如何删除已合并的本地分支？
```bash
# 删除单个已合并的分支
git branch -d feature/system-user-export

# 批量删除已合并的本地分支
git branch --merged dev | grep -v "\* dev" | grep -v "master" | xargs -n 1 git branch -d
```

### Q6: 如何查看两个分支的差异？
```bash
# 查看分支差异（文件列表）
git diff dev..feature/xxx --name-only

# 查看分支差异（详细内容）
git diff dev..feature/xxx

# 查看分支的提交差异
git log dev..feature/xxx --oneline
```

## 最佳实践建议

1. **频繁提交，及时推送**：每完成一个小功能就提交，避免一次提交过多修改
2. **编写清晰的提交信息**：让他人（包括未来的自己）能快速理解修改内容
3. **保持分支整洁**：定期同步主分支，及时删除已合并的分支
4. **认真进行代码审查**：审查不仅是检查错误，更是知识共享和团队学习的机会
5. **善用Git工具**：使用图形化工具（如 SourceTree、GitKraken）可以更直观地管理分支
6. **备份重要代码**：在执行危险操作（如 reset、rebase）前，先创建备份分支
7. **团队沟通**：遇到复杂冲突或不确定的操作，及时与团队成员沟通
8. **持续学习**：Git功能强大，定期学习新的命令和技巧可以提高工作效率
