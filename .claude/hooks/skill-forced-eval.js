#!/usr/bin/env node
/**
 * UserPromptSubmit Hook - 强制技能评估（跨平台版本）
 * 功能：开发场景下，将Skills激活率从约25&提升到90%以上
 */

const fs = require('fs');

//从stdin 读取用户输入
let inputData = '';
try {
    inputData = fs.readFileSync(0, 'utf8')
} catch {
    process.exit(0);
}

let input;
try {
    input = JSON.parse(inputData)
} catch {
    process.exit(0);
}

// 检测是否是斜杠命令
// 规则：以 / 开头，且后面不包含第二个 / （排除 /iot/device 这样的路径）
const prompt = (input.prompt || '').trim();
const firstWord = prompt.split(/\s/)[0];
const isSlashCommand = /^\/[^\/\s]+$/.test(firstWord) && !prompt.includes('://');

if(isSlashCommand){
    // 斜杠命令，跳过技能评估
    process.exit(0)
}

const instructions = `## 指令：强制技能激活流程（必须执行）

### 步骤 1 - 评估
针对以下每个技能，陈述：[技能名] - 是/否 - [理由]

可用技能列表：
### 后端开发
- crud-development：四层架构 CRUD 开发规范
- api-development：RESTful API 设计规范
- database-ops：数据库操作、建表、字典
- backend-annotations：注解使用规范
- error-handler：异常处理规范

### 前端开发
- ui-development：Element Plus 封装组件使用
- store-pc：Pinia 状态管理

### 移动端
- ui-mobile：WD UI 组件库
- ui-design-mobile：移动端设计规范
- store-mobile：移动端状态管理
- uniapp-platform：跨平台条件编译

### 业务集成
- payment-integration：支付功能集成
- wechat-integration：微信生态集成
- file-oss-management：文件上传与 OSS
- ai-langchain4j：AI 大模型集成

### 质量保障
- bug-detective：Bug 排查
- performance-doctor：性能优化
- security-guard：安全防护
- code-patterns：代码规范

### 工程管理
- architecture-design：架构设计
- project-navigator：项目结构导航
- git-workflow：Git 工作流
- tech-decision：技术选型
- brainstorm：头脑风暴

### 步骤 2 - 激活
如果任何技能为"是" → 立即使用 Skill() 工具激活
如果所有技能为"否" → 说明"不需要技能"并继续

### 步骤 3 - 实现
只有在步骤 2 完成后，才能开始实现。`;

console.log(instructions);
process.exit(0);
