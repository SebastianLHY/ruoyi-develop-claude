# 插件开发模板

快速创建插件的模板文件。

---

## 📋 目录结构模板

```
my-plugin/
├── plugin.json       # 插件清单
├── index.js          # 插件主文件
├── README.md         # 插件文档
├── config.json       # 配置文件（可选）
├── lib/              # 库文件（可选）
│   └── utils.js
└── tests/            # 测试文件（可选）
    └── index.test.js
```

---

## 📝 plugin.json 模板

### 命令插件

```json
{
  "name": "my-command",
  "version": "1.0.0",
  "type": "command",
  "description": "我的命令插件",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "main": "index.js",
  "enabled": true,
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/my-command"
  },
  "keywords": ["cli", "command", "java-development"],
  "dependencies": {},
  "config": {
    "option1": "value1",
    "option2": "value2"
  },
  "commands": {
    "my-command": {
      "description": "执行我的命令",
      "usage": "jdc my-command [options] [args]",
      "options": {
        "--verbose": "显示详细信息",
        "--force": "强制执行"
      },
      "examples": [
        "jdc my-command",
        "jdc my-command --verbose"
      ]
    }
  }
}
```

### 步骤插件

```json
{
  "name": "my-step",
  "version": "1.0.0",
  "type": "step",
  "description": "我的步骤插件",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "main": "index.js",
  "enabled": true,
  "config": {
    "checkDependencies": true,
    "autoBackup": false,
    "timeout": 30000
  }
}
```

### 智能体插件

```json
{
  "name": "my-agent",
  "version": "1.0.0",
  "type": "agent",
  "description": "我的智能体插件",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "main": "index.js",
  "enabled": true,
  "config": {
    "model": "claude-3",
    "temperature": 0.7",
    "maxTokens": 4096,
    "apiKey": ""
  }
}
```

### 钩子插件

```json
{
  "name": "my-hook",
  "version": "1.0.0",
  "type": "hook",
  "description": "我的钩子插件",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "main": "index.js",
  "enabled": true,
  "hooks": {
    "before-command": true,
    "after-command": true,
    "before-step": true,
    "after-step": true,
    "before-agent": true,
    "after-agent": true,
    "on-error": true,
    "on-success": true
  }
}
```

---

## 💻 index.js 模板

### 命令插件

```javascript
/**
 * 我的命令插件
 * 描述: [插件描述]
 * 作者: [Your Name]
 * 版本: 1.0.0
 */

const fs = require('fs');
const path = require('path');

// 插件配置
let config = {
  option1: 'default1',
  option2: 'default2'
};

/**
 * 初始化插件
 * @param {Object} globalConfig - 全局配置
 */
function init(globalConfig) {
  console.log('[my-command] 插件初始化');
  
  // 合并配置
  config = { ...config, ...globalConfig };
  
  // 执行初始化逻辑
  // ...
}

/**
 * 执行命令
 * @param {Array} args - 命令参数
 * @returns {Promise<Object>} 执行结果
 */
async function execute(args) {
  console.log('[my-command] 执行命令:', args);
  
  try {
    // 解析参数
    const options = {
      verbose: args.includes('--verbose'),
      force: args.includes('--force')
    };
    
    const cmdArgs = args.filter(arg => !arg.startsWith('--'));
    
    // 执行命令逻辑
    const result = await executeLogic(cmdArgs, options);
    
    return {
      success: true,
      message: '命令执行成功',
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 命令主逻辑
 * @private
 */
async function executeLogic(args, options) {
  // 实现你的命令逻辑
  
  if (options.verbose) {
    console.log('详细模式');
  }
  
  // 返回结果
  return {
    processed: args.length,
    items: args
  };
}

/**
 * 启用插件
 */
function enable() {
  console.log('[my-command] 插件已启用');
}

/**
 * 禁用插件
 */
function disable() {
  console.log('[my-command] 插件已禁用');
}

/**
 * 清理资源
 */
function cleanup() {
  console.log('[my-command] 插件清理完成');
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

### 步骤插件

```javascript
/**
 * 我的步骤插件
 * 描述: [插件描述]
 * 作者: [Your Name]
 * 版本: 1.0.0
 */

// 插件配置
let config = {
  checkDependencies: true,
  autoBackup: false,
  timeout: 30000
};

/**
 * 初始化插件
 */
function init(globalConfig) {
  console.log('[my-step] 步骤插件初始化');
  config = { ...config, ...globalConfig };
}

/**
 * 执行步骤
 * @param {Object} context - 执行上下文
 * @returns {Promise<Object>} 执行结果
 */
async function execute(context) {
  console.log('[my-step] 执行步骤');
  
  const results = {
    success: true,
    steps: []
  };
  
  try {
    // 步骤1: 前置检查
    if (config.checkDependencies) {
      const depCheck = await checkDependencies(context);
      results.steps.push(depCheck);
      
      if (!depCheck.success) {
        results.success = false;
        return results;
      }
    }
    
    // 步骤2: 主要逻辑
    const mainResult = await executeMainLogic(context);
    results.steps.push(mainResult);
    
    if (!mainResult.success) {
      results.success = false;
      return results;
    }
    
    // 步骤3: 后置处理
    const postProcess = await postProcessing(context, mainResult);
    results.steps.push(postProcess);
    
    if (!postProcess.success) {
      results.success = false;
    }
    
    return results;
  } catch (error) {
    results.success = false;
    results.error = error.message;
    return results;
  }
}

/**
 * 检查依赖
 * @private
 */
async function checkDependencies(context) {
  // 实现依赖检查逻辑
  return {
    name: 'dependency-check',
    success: true,
    message: '依赖检查通过'
  };
}

/**
 * 执行主逻辑
 * @private
 */
async function executeMainLogic(context) {
  // 实现主要逻辑
  return {
    name: 'main-logic',
    success: true,
    message: '主逻辑执行成功',
    data: {}
  };
}

/**
 * 后置处理
 * @private
 */
async function postProcessing(context, mainResult) {
  // 实现后置处理
  return {
    name: 'post-processing',
    success: true,
    message: '后置处理完成'
  };
}

/**
 * 获取步骤信息
 */
function getInfo() {
  return {
    name: 'My Step',
    description: '我的自定义步骤',
    phase: 'custom',
    order: 100,
    dependencies: [],
    outputs: []
  };
}

module.exports = {
  init,
  execute,
  getInfo
};
```

### 智能体插件

```javascript
/**
 * 我的智能体插件
 * 描述: [插件描述]
 * 作者: [Your Name]
 * 版本: 1.0.0
 */

const fs = require('fs');
const path = require('path');

// 插件配置
let config = {
  model: 'claude-3',
  temperature: 0.7,
  maxTokens: 4096,
  apiKey: ''
};

/**
 * 初始化插件
 */
function init(globalConfig) {
  console.log('[my-agent] 智能体插件初始化');
  config = { ...config, ...globalConfig };
}

/**
 * 执行智能体任务
 * @param {string} task - 任务描述
 * @returns {Promise<Object>} 执行结果
 */
async function execute(task) {
  console.log('[my-agent] 执行任务:', task);
  
  try {
    // 读取智能体配置
    const agentFile = path.join(__dirname, 'AGENT.md');
    let agentPrompt = '';
    
    if (fs.existsSync(agentFile)) {
      agentPrompt = fs.readFileSync(agentFile, 'utf-8');
    }
    
    // 构建提示词
    const prompt = buildPrompt(agentPrompt, task);
    
    // 调用AI API
    const response = await callAI(prompt);
    
    return {
      success: true,
      task: task,
      response: response,
      model: config.model
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 构建提示词
 * @private
 */
function buildPrompt(agentPrompt, task) {
  return `
${agentPrompt}

任务: ${task}

请按照智能体的职责完成此任务。
  `.trim();
}

/**
 * 调用AI API
 * @private
 */
async function callAI(prompt) {
  // 实现AI API调用
  // 这里是示例实现
  
  console.log('调用AI API...');
  console.log('提示词:', prompt);
  
  // 返回模拟响应
  return '这是AI的响应';
}

/**
 * 获取智能体信息
 */
function getInfo() {
  return {
    name: 'My Agent',
    description: '我的自定义智能体',
    capabilities: [],
    model: config.model
  };
}

module.exports = {
  init,
  execute,
  getInfo
};
```

### 钩子插件

```javascript
/**
 * 我的钩子插件
 * 描述: [插件描述]
 * 作者: [Your Name]
 * 版本: 1.0.0
 */

/**
 * 初始化插件
 */
function init(globalConfig) {
  console.log('[my-hook] 钩子插件初始化');
}

/**
 * 钩子定义
 */
const hooks = {
  /**
   * 命令执行前
   */
  'before-command': async (context) => {
    console.log('[before-command]', context.plugin);
    // 实现你的逻辑
  },
  
  /**
   * 命令执行后
   */
  'after-command': async (context) => {
    console.log('[after-command]', context.plugin);
    // 实现你的逻辑
  },
  
  /**
   * 步骤执行前
   */
  'before-step': async (context) => {
    console.log('[before-step]', context.plugin);
    // 实现你的逻辑
  },
  
  /**
   * 步骤执行后
   */
  'after-step': async (context) => {
    console.log('[after-step]', context.plugin);
    // 实现你的逻辑
  },
  
  /**
   * 智能体执行前
   */
  'before-agent': async (context) => {
    console.log('[before-agent]', context.plugin);
    // 实现你的逻辑
  },
  
  /**
   * 智能体执行后
   */
  'after-agent': async (context) => {
    console.log('[after-agent]', context.plugin);
    // 实现你的逻辑
  },
  
  /**
   * 错误发生时
   */
  'on-error': async (context) => {
    console.error('[on-error]', context.error);
    // 实现你的逻辑
  },
  
  /**
   * 成功完成时
   */
  'on-success': async (context) => {
    console.log('[on-success]', context.plugin);
    // 实现你的逻辑
  }
};

module.exports = {
  init,
  hooks
};
```

---

## 📖 README.md 模板

```markdown
# [插件名称]

[简短描述]

## 功能特性

- ✅ 特性1
- ✅ 特性2
- ✅ 特性3

## 安装

```bash
# 克隆或复制插件到plugins目录
cp -r my-plugin .claude/cli/plugins/
```

## 使用方法

```bash
# 基本使用
jdc my-command

# 使用选项
jdc my-command --verbose

# 查看帮助
jdc plugin:info my-command
```

## 配置

编辑 `plugin.json` 或 `config.json`:

```json
{
  "option1": "value1",
  "option2": "value2"
}
```

## 示例

### 示例1

```bash
jdc my-command arg1 arg2
```

输出:
```
[示例输出]
```

### 示例2

```bash
jdc my-command --verbose
```

输出:
```
[示例输出]
```

## API

### execute(args)

执行命令。

**参数:**
- `args` (Array): 命令参数

**返回:**
- Promise<Object>: 执行结果

## 依赖

- Node.js >= 14.0.0
- [其他依赖]

## 开发

```bash
# 运行测试
npm test

# 调试
node --inspect cli.js my-command
```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 许可证

[MIT](LICENSE)

## 作者

[Your Name] <your.email@example.com>

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md)
```

---

## 🧪 测试模板

```javascript
/**
 * 插件测试
 */

const plugin = require('../index');

describe('My Plugin', () => {
  beforeAll(() => {
    plugin.init({});
  });
  
  test('should execute successfully', async () => {
    const result = await plugin.execute(['arg1', 'arg2']);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
  
  test('should handle errors', async () => {
    const result = await plugin.execute(['invalid']);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
  
  afterAll(() => {
    if (plugin.cleanup) {
      plugin.cleanup();
    }
  });
});
```

---

## 📝 package.json 模板 (可选)

```json
{
  "name": "jdc-plugin-my-command",
  "version": "1.0.0",
  "description": "我的CLI插件",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "lint": "eslint ."
  },
  "keywords": [
    "java-development-claude",
    "cli-plugin",
    "command"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

---

## 🚀 快速开始

1. **创建插件目录**
   ```bash
   mkdir -p .claude/cli/plugins/my-plugin
   cd .claude/cli/plugins/my-plugin
   ```

2. **复制模板文件**
   - 根据插件类型选择对应的模板
   - 复制 plugin.json 和 index.js
   - 创建 README.md

3. **修改配置**
   - 更新 plugin.json 中的信息
   - 实现 index.js 中的逻辑

4. **测试插件**
   ```bash
   jdc plugin:list
   jdc plugin:info my-plugin
   jdc my-plugin
   ```

5. **发布插件** (可选)
   - 创建 GitHub 仓库
   - 发布到 NPM
   - 分享给社区

---

祝你开发愉快！ 🎉
