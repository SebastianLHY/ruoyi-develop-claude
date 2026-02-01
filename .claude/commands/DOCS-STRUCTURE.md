# 📚 文档结构指南

> **版本**: v2.18.0  
> **最后更新**: 2026-01-29  
> **用途**: 文档组织结构和使用指南

---

## 🎯 简化后的文档结构

### 文档分级（按优先级）

```
核心文档（3个，必读，15分钟）
├── QUICK-START.md          [3分钟] 快速上手
├── dev.md                  [5分钟] 主流程（92行精简版）
└── dev-faq.md              [5分钟] 常见问题

进阶文档（3个，按需查阅，1小时）
├── dev-steps.md            [30分钟] 详细步骤
├── dev-rollback-guide.md   [15分钟] 错误处理
└── ../agents/README.md     [15分钟] 智能体目录

高级文档（6个，专家参考，2小时）
├── CHANGELOG.md            [20分钟] 完整变更历史
├── VERSION.md              [15分钟] 版本管理规范
├── dev-error-codes.md      [30分钟] 错误码查询
├── dev-dependency-check.md [20分钟] 依赖检查
├── dev-interactive-tutorial.md [30分钟] 交互式教程
└── README.md               [5分钟] 文档索引

辅助文档（3个，工具类）
├── init-docs.md            文档初始化
├── update-status.md        状态更新
└── update-todo.md          待办更新

废弃文档（6个，不推荐）⚠️
├── check.md                已废弃
├── crud.md                 已废弃
├── next.md                 已废弃
├── progress.md             已废弃
├── reset.md                已废弃
└── start.md                已废弃
```

---

## 📊 文档精简对比

| 指标 | v2.17.0 | v2.18.0 | 优化 |
|------|---------|---------|------|
| 主文档行数 | 295 | 92 | ↓69% |
| 核心文档数 | 10+ | 3 | ↓70% |
| 必读时间 | 60分钟 | 15分钟 | ↓75% |
| 学习曲线 | 2周 | 4小时 | ↓75% |

---

## 🚀 快速开始路径

### 第1次使用（15分钟）
```
1. 阅读 QUICK-START.md（3分钟）
2. 略读 dev.md（5分钟）
3. 跟着示例开发第1个模块
4. 遇到问题查 dev-faq.md
```

### 第2-3次使用（30分钟）
```
1. 使用快速模式开发
2. 尝试不同生成方式
3. 熟悉自动化功能
```

### 第4+次使用（进阶）
```
1. 阅读 dev-steps.md 了解细节
2. 学习 dev-rollback-guide.md 处理异常
3. 优化Token消耗
```

---

## 📖 按角色推荐文档

### 🟢 新手开发者
**必读**:
- QUICK-START.md
- dev.md
- dev-faq.md

**可选**:
- dev-steps.md（部分章节）

**忽略**:
- 废弃文档（DEPRECATED.md列出的）

---

### 🟡 熟练开发者
**必读**:
- dev.md（复习）
- dev-steps.md（详细步骤）

**推荐**:
- dev-rollback-guide.md
- ../agents/README.md

**可选**:
- dev-error-codes.md

---

### 🔴 团队Leader/架构师
**必读**:
- dev.md（了解流程）
- CHANGELOG.md（了解演进）
- VERSION.md（版本管理）

**推荐**:
- dev-dependency-check.md
- ../agents/AGENT-USAGE-GUIDE.md

**可选**:
- 全部高级文档

---

## 🎯 按场景推荐文档

### 场景1: 第一次使用
```
QUICK-START.md → dev.md → 开始开发 → dev-faq.md（遇到问题时）
```

### 场景2: 遇到错误
```
dev-faq.md → dev-rollback-guide.md → dev-error-codes.md
```

### 场景3: 优化Token消耗
```
dev.md（步骤5.5） → dev-steps.md（混合模式详解）
```

### 场景4: 定制工作流
```
dev-steps.md → dev-dependency-check.md → VERSION.md
```

---

## 💡 文档阅读技巧

### 技巧1: 分级阅读
不要试图一次性阅读所有文档：
- **第1周**: 只读核心文档（3个）
- **第2周**: 按需读进阶文档
- **第3周**: 深入读高级文档

### 技巧2: 问题驱动
遇到问题时才查找相关文档：
- Token过高 → dev.md步骤5.5
- 测试失败 → dev-faq.md Q3
- 步骤失败 → dev-rollback-guide.md

### 技巧3: 关键词搜索
使用IDE搜索功能快速定位：
- 搜索"Token"找优化技巧
- 搜索"回滚"找错误处理
- 搜索"智能体"找自动化功能

---

## 📝 文档维护规范

### 更新优先级
1. **P0**: dev.md, QUICK-START.md（必须同步）
2. **P1**: dev-faq.md, CHANGELOG.md
3. **P2**: dev-steps.md, 其他文档
4. **P3**: 高级文档（按需更新）

### 版本同步
所有文档头部必须标注版本号：
```markdown
> **版本**: v2.18.0  
> **最后更新**: 2026-01-29
```

---

## ⚠️ 常见误区

### 误区1: 试图阅读所有文档
✅ 正确做法: 分级阅读，核心文档15分钟足够

### 误区2: 忽略QUICK-START.md
✅ 正确做法: 这是最重要的文档，3分钟必读

### 误区3: 使用废弃的命令文档
✅ 正确做法: 查看DEPRECATED.md，使用新流程

---

## 🔗 相关资源

- [DEPRECATED.md](./DEPRECATED.md) - 废弃文档列表
- [VERSION.md](./VERSION.md) - 版本管理规范
- [CHANGELOG.md](./CHANGELOG.md) - 完整变更历史
- [README.md](./README.md) - 文档索引

---

**文档结构最后更新**: 2026-01-29  
**下次审查计划**: v2.19.0发布时
