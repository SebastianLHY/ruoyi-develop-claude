#!/usr/bin/env node

/**
 * Java Development Claude CLI Tool
 * 命令行快速启动工具，支持脚本化执行
 * 
 * 使用方法:
 *   node cli.js <command> [options]
 * 
 * 命令列表:
 *   start       - 启动开发流程
 *   check       - 检查项目状态
 *   progress    - 查看进度
 *   next        - 执行下一步
 *   reset       - 重置项目
 *   init-docs   - 初始化文档
 *   update-status - 更新项目状态
 *   update-todo - 更新待办清单
 *   dependency-check - 检查步骤依赖
 *   help        - 显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PluginManager, PluginType } = require('./plugin-manager');

// 配置
const CONFIG = {
  commandsDir: path.join(__dirname, '..', 'commands'),
  agentsDir: path.join(__dirname, '..', 'agents'),
  projectRoot: path.join(__dirname, '..', '..'),
  pluginsDir: path.join(__dirname, 'plugins'),
  claudeCmd: 'claude',
  skipPermissions: true
};

// 初始化插件管理器
const pluginManager = new PluginManager(CONFIG.pluginsDir, CONFIG);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

// 命令映射
const COMMANDS = {
  'start': {
    file: 'start.md',
    description: '启动开发流程',
    prompt: '请根据 start.md 指令启动开发流程'
  },
  'check': {
    file: 'check.md',
    description: '检查项目状态',
    prompt: '请根据 check.md 指令检查项目状态'
  },
  'progress': {
    file: 'progress.md',
    description: '查看进度',
    prompt: '请根据 progress.md 指令查看项目进度'
  },
  'next': {
    file: 'next.md',
    description: '执行下一步',
    prompt: '请根据 next.md 指令执行下一步操作'
  },
  'reset': {
    file: 'reset.md',
    description: '重置项目',
    prompt: '请根据 reset.md 指令重置项目状态'
  },
  'init-docs': {
    file: 'init-docs.md',
    description: '初始化文档',
    prompt: '请根据 init-docs.md 指令初始化项目文档'
  },
  'update-status': {
    file: 'update-status.md',
    description: '更新项目状态',
    prompt: '请根据 update-status.md 指令更新项目状态'
  },
  'update-todo': {
    file: 'update-todo.md',
    description: '更新待办清单',
    prompt: '请根据 update-todo.md 指令更新待办清单'
  },
  'dependency-check': {
    file: 'dev-dependency-check.md',
    description: '检查步骤依赖',
    prompt: '请根据 dev-dependency-check.md 检查当前步骤的前置依赖'
  },
  'dev': {
    file: 'dev.md',
    description: '查看开发流程',
    prompt: '请根据 dev.md 查看完整的开发流程'
  },
  'quick-start': {
    file: 'QUICK-START.md',
    description: '快速开始指南',
    prompt: '请根据 QUICK-START.md 指导我快速上手'
  },
  'faq': {
    file: 'dev-faq.md',
    description: '常见问题',
    prompt: '请根据 dev-faq.md 回答常见问题'
  },
  'crud': {
    file: 'crud.md',
    description: 'CRUD操作',
    prompt: '请根据 crud.md 执行CRUD操作'
  }
};

// 步骤命令映射
const STEP_COMMANDS = {
  'step1': { description: '步骤1: 需求澄清与分析', step: 1 },
  'step2': { description: '步骤2: 技术设计与模块规划', step: 2 },
  'step3': { description: '步骤3: Git初始化', step: 3 },
  'step4': { description: '步骤4: 文档初始化', step: 4 },
  'step5': { description: '步骤5: 数据库设计', step: 5 },
  'step5.5': { description: '步骤5.5: 代码生成方式选择', step: 5.5 },
  'step6': { description: '步骤6: 后端开发', step: 6 },
  'step7': { description: '步骤7: 前端开发', step: 7 },
  'step8': { description: '步骤8: 测试验证', step: 8 },
  'step9': { description: '步骤9: 代码质量检查', step: 9 },
  'step10': { description: '步骤10: 文档更新', step: 10 },
  'step11': { description: '步骤11: Git提交与合并', step: 11 }
};

// Agent命令映射
const AGENT_COMMANDS = {
  'requirements-analyst': {
    file: 'requirements-analyst/AGENT.md',
    description: '需求分析师',
    prompt: '请激活需求分析师智能体'
  },
  'code-generator': {
    file: 'code-generator/AGENT.md',
    description: '代码生成器',
    prompt: '请激活代码生成器智能体'
  },
  'ui-generator': {
    file: 'ui-generator/AGENT.md',
    description: 'UI生成器',
    prompt: '请激活UI生成器智能体'
  },
  'test-engineer': {
    file: 'test-engineer/AGENT.md',
    description: '测试工程师',
    prompt: '请激活测试工程师智能体'
  },
  'quality-inspector': {
    file: 'quality-inspector/AGENT.md',
    description: '质量检查员',
    prompt: '请激活质量检查员智能体'
  },
  'bug-detective': {
    file: 'bug-detective/AGENT.md',
    description: 'Bug侦探',
    prompt: '请激活Bug侦探智能体'
  },
  'code-reviewer': {
    file: 'code-reviewer/AGENT.md',
    description: '代码审查员',
    prompt: '请激活代码审查员智能体'
  },
  'git-workflow-manager': {
    file: 'git-workflow-manager/AGENT.md',
    description: 'Git工作流管理器',
    prompt: '请激活Git工作流管理器智能体'
  },
  'project-manager': {
    file: 'project-manager/AGENT.md',
    description: '项目管理器',
    prompt: '请激活项目管理器智能体'
  },
  'deployment-assistant': {
    file: 'deployment-assistant/AGENT.md',
    description: '部署助手',
    prompt: '请激活部署助手智能体'
  },
  'release-manager': {
    file: 'release-manager/AGENT.md',
    description: '发布管理器',
    prompt: '请激活发布管理器智能体'
  }
};

// 读取命令文件
function readCommandFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    logError(`无法读取文件: ${filePath}`);
    logError(error.message);
    return null;
  }
}

// 执行Claude命令
function executeClaude(prompt, options = {}) {
  const { dryRun = false, verbose = false } = options;
  
  if (dryRun) {
    logInfo('Dry Run 模式 - 不执行实际命令');
    log(`\n提示词:\n${prompt}\n`, 'cyan');
    return;
  }

  try {
    const cmdParts = [CONFIG.claudeCmd];
    
    if (CONFIG.skipPermissions) {
      cmdParts.push('--dangerously-skip-permissions');
    }
    
    cmdParts.push(`"${prompt}"`);
    
    const cmd = cmdParts.join(' ');
    
    if (verbose) {
      logInfo(`执行命令: ${cmd}`);
    }
    
    logInfo('正在执行Claude命令...');
    
    const result = execSync(cmd, {
      cwd: CONFIG.projectRoot,
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    
    logSuccess('命令执行完成');
    
  } catch (error) {
    logError('命令执行失败');
    if (verbose) {
      logError(error.message);
    }
    process.exit(1);
  }
}

// 执行命令
function executeCommand(commandName, args) {
  const command = COMMANDS[commandName];
  
  if (!command) {
    logError(`未知命令: ${commandName}`);
    showHelp();
    process.exit(1);
  }
  
  logHeader(`执行命令: ${commandName}`);
  logInfo(command.description);
  
  const filePath = path.join(CONFIG.commandsDir, command.file);
  
  if (!fs.existsSync(filePath)) {
    logError(`命令文件不存在: ${command.file}`);
    process.exit(1);
  }
  
  const content = readCommandFile(filePath);
  
  if (!content) {
    process.exit(1);
  }
  
  // 构建提示词
  let prompt = command.prompt;
  
  // 如果有额外参数，添加到提示词中
  if (args.length > 0) {
    prompt += `\n\n额外参数: ${args.join(' ')}`;
  }
  
  // 执行选项
  const options = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
  };
  
  executeClaude(prompt, options);
}

// 执行步骤命令
function executeStep(stepName, args) {
  const step = STEP_COMMANDS[stepName];
  
  if (!step) {
    logError(`未知步骤: ${stepName}`);
    showStepHelp();
    process.exit(1);
  }
  
  logHeader(`执行步骤: ${stepName}`);
  logInfo(step.description);
  
  const filePath = path.join(CONFIG.commandsDir, 'dev-steps.md');
  
  if (!fs.existsSync(filePath)) {
    logError('dev-steps.md 文件不存在');
    process.exit(1);
  }
  
  // 构建提示词
  let prompt = `请执行开发流程的步骤${step.step}: ${step.description}`;
  
  // 如果有额外参数，添加到提示词中
  if (args.length > 0) {
    prompt += `\n\n额外信息: ${args.join(' ')}`;
  }
  
  prompt += `\n\n请参考 dev-steps.md 中的详细说明执行此步骤。`;
  
  // 执行选项
  const options = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
  };
  
  executeClaude(prompt, options);
}

// 执行Agent命令
function executeAgent(agentName, args) {
  const agent = AGENT_COMMANDS[agentName];
  
  if (!agent) {
    logError(`未知智能体: ${agentName}`);
    showAgentHelp();
    process.exit(1);
  }
  
  logHeader(`激活智能体: ${agentName}`);
  logInfo(agent.description);
  
  const filePath = path.join(CONFIG.agentsDir, agent.file);
  
  if (!fs.existsSync(filePath)) {
    logError(`智能体文件不存在: ${agent.file}`);
    process.exit(1);
  }
  
  // 构建提示词
  let prompt = agent.prompt;
  
  // 如果有额外参数，添加到提示词中
  if (args.length > 0) {
    prompt += `\n\n任务: ${args.join(' ')}`;
  }
  
  // 执行选项
  const options = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
  };
  
  executeClaude(prompt, options);
}

// 显示帮助信息
function showHelp() {
  logHeader('Java Development Claude CLI Tool');
  
  log('\n使用方法:', 'bright');
  log('  node cli.js <command> [options] [args]');
  log('  或使用快捷脚本: jdc <command> [options] [args]');
  
  log('\n基础命令:', 'bright');
  Object.entries(COMMANDS).forEach(([name, cmd]) => {
    log(`  ${name.padEnd(20)} - ${cmd.description}`, 'cyan');
  });
  
  log('\n步骤命令:', 'bright');
  log('  step<N>              - 执行指定步骤 (例: step1, step2, step5.5)', 'cyan');
  Object.entries(STEP_COMMANDS).forEach(([name, step]) => {
    log(`  ${name.padEnd(20)} - ${step.description}`, 'cyan');
  });
  
  log('\n智能体命令:', 'bright');
  log('  agent:<name>         - 激活指定智能体', 'cyan');
  Object.entries(AGENT_COMMANDS).forEach(([name, agent]) => {
    log(`  agent:${name.padEnd(25)} - ${agent.description}`, 'cyan');
  });
  
  log('\n选项:', 'bright');
  log('  --dry-run            - 仅显示将要执行的命令，不实际执行', 'yellow');
  log('  --verbose, -v        - 显示详细执行信息', 'yellow');
  log('  --help, -h           - 显示帮助信息', 'yellow');
  
  log('\n插件管理命令:', 'bright');
  log('  plugin:list              - 列出所有插件', 'cyan');
  log('  plugin:info <name>       - 查看插件信息', 'cyan');
  log('  plugin:enable <name>     - 启用插件', 'cyan');
  log('  plugin:disable <name>    - 禁用插件', 'cyan');
  log('  plugin:reload <name>     - 重载插件', 'cyan');
  log('  plugin:search <query>    - 搜索插件', 'cyan');
  
  log('\n示例:', 'bright');
  log('  node cli.js start                    # 启动开发流程', 'green');
  log('  node cli.js step1                    # 执行步骤1', 'green');
  log('  node cli.js agent:code-generator     # 激活代码生成器', 'green');
  log('  node cli.js check --verbose          # 检查项目状态(详细模式)', 'green');
  log('  node cli.js next --dry-run           # 预览下一步操作', 'green');
  log('  node cli.js plugin:list              # 列出所有插件', 'green');
  log('  node cli.js hello-world              # 执行插件命令', 'green');
  log('  node cli.js agent:custom-agent "任务" # 执行插件智能体', 'green');
  
  log('\n快捷脚本:', 'bright');
  log('  使用 jdc.bat (Windows) 或 jdc.sh (Linux/Mac) 作为快捷方式', 'cyan');
  log('  例: jdc start, jdc step1, jdc agent:code-generator', 'cyan');
  log('  例: jdc plugin:list, jdc hello-world', 'cyan');
  
  log('');
}

// 显示步骤帮助
function showStepHelp() {
  logHeader('开发流程步骤');
  
  log('\n可用步骤:', 'bright');
  Object.entries(STEP_COMMANDS).forEach(([name, step]) => {
    log(`  ${name.padEnd(10)} - ${step.description}`, 'cyan');
  });
  
  log('\n使用方法:', 'bright');
  log('  node cli.js <step> [额外信息]');
  log('  例: node cli.js step1 "开发用户管理模块"');
  
  log('');
}

// 显示Agent帮助
function showAgentHelp() {
  logHeader('可用智能体');
  
  log('\n智能体列表:', 'bright');
  Object.entries(AGENT_COMMANDS).forEach(([name, agent]) => {
    log(`  agent:${name.padEnd(25)} - ${agent.description}`, 'cyan');
  });
  
  log('\n使用方法:', 'bright');
  log('  node cli.js agent:<name> [任务描述]');
  log('  例: node cli.js agent:code-generator "生成用户管理模块代码"');
  
  log('');
}

// 显示版本信息
function showVersion() {
  const packageJson = require(path.join(__dirname, 'package.json'));
  log(`Java Development Claude CLI v${packageJson.version}`, 'bright');
}

// 加载插件
function loadPlugins() {
  try {
    pluginManager.loadPlugins();
    const plugins = pluginManager.getAllPlugins();
    
    if (plugins.length > 0) {
      logInfo(`已加载 ${plugins.length} 个插件`);
    }
  } catch (error) {
    logWarning(`插件加载失败: ${error.message}`);
  }
}

// 执行插件命令
async function executePluginCommand(pluginName, args) {
  logHeader(`执行插件命令: ${pluginName}`);
  
  try {
    const result = await pluginManager.executeCommandPlugin(pluginName, args);
    
    if (result && result.success) {
      logSuccess('插件命令执行成功');
    } else {
      logError('插件命令执行失败');
    }
    
    return result;
  } catch (error) {
    logError(`插件命令执行失败: ${error.message}`);
    throw error;
  }
}

// 执行插件步骤
async function executePluginStep(pluginName, context) {
  logHeader(`执行插件步骤: ${pluginName}`);
  
  try {
    const result = await pluginManager.executeStepPlugin(pluginName, context);
    
    if (result && result.success) {
      logSuccess('插件步骤执行成功');
    } else {
      logError('插件步骤执行失败');
    }
    
    return result;
  } catch (error) {
    logError(`插件步骤执行失败: ${error.message}`);
    throw error;
  }
}

// 执行插件智能体
async function executePluginAgent(pluginName, task) {
  logHeader(`执行插件智能体: ${pluginName}`);
  
  try {
    const result = await pluginManager.executeAgentPlugin(pluginName, task);
    
    if (result && result.success) {
      logSuccess('插件智能体执行成功');
    } else {
      logError('插件智能体执行失败');
    }
    
    return result;
  } catch (error) {
    logError(`插件智能体执行失败: ${error.message}`);
    throw error;
  }
}

// 插件管理命令
function handlePluginManagement(subCommand, args) {
  switch (subCommand) {
    case 'list':
      listPlugins();
      break;
    case 'info':
      showPluginInfo(args[0]);
      break;
    case 'enable':
      enablePlugin(args[0]);
      break;
    case 'disable':
      disablePlugin(args[0]);
      break;
    case 'reload':
      reloadPlugin(args[0]);
      break;
    case 'search':
      searchPlugins(args[0]);
      break;
    default:
      logError(`未知的插件管理命令: ${subCommand}`);
      log('\n可用命令:', 'bright');
      log('  plugin:list              - 列出所有插件', 'cyan');
      log('  plugin:info <name>       - 查看插件信息', 'cyan');
      log('  plugin:enable <name>     - 启用插件', 'cyan');
      log('  plugin:disable <name>    - 禁用插件', 'cyan');
      log('  plugin:reload <name>     - 重载插件', 'cyan');
      log('  plugin:search <query>    - 搜索插件', 'cyan');
  }
}

// 列出插件
function listPlugins() {
  logHeader('已安装的插件');
  
  const plugins = pluginManager.listPlugins();
  
  if (plugins.length === 0) {
    logInfo('没有安装任何插件');
    return;
  }
  
  plugins.forEach(plugin => {
    const status = plugin.enabled ? '✓' : '✗';
    const statusColor = plugin.enabled ? 'green' : 'red';
    
    log(`\n[${status}] ${plugin.name} v${plugin.version}`, statusColor);
    log(`    类型: ${plugin.type}`, 'cyan');
    log(`    描述: ${plugin.description}`);
    if (plugin.author) {
      log(`    作者: ${plugin.author}`);
    }
  });
  
  log('');
}

// 显示插件信息
function showPluginInfo(name) {
  if (!name) {
    logError('请指定插件名称');
    return;
  }
  
  const info = pluginManager.getPluginInfo(name);
  
  if (!info) {
    logError(`插件不存在: ${name}`);
    return;
  }
  
  logHeader(`插件信息: ${info.name}`);
  
  log(`\n名称: ${info.name}`, 'bright');
  log(`版本: ${info.version}`);
  log(`类型: ${info.type}`);
  log(`描述: ${info.description}`);
  if (info.author) {
    log(`作者: ${info.author}`);
  }
  log(`状态: ${info.enabled ? '已启用' : '已禁用'}`, info.enabled ? 'green' : 'red');
  log(`路径: ${info.path}`);
  
  log('');
}

// 启用插件
function enablePlugin(name) {
  if (!name) {
    logError('请指定插件名称');
    return;
  }
  
  try {
    pluginManager.enablePlugin(name);
    logSuccess(`插件已启用: ${name}`);
  } catch (error) {
    logError(`启用插件失败: ${error.message}`);
  }
}

// 禁用插件
function disablePlugin(name) {
  if (!name) {
    logError('请指定插件名称');
    return;
  }
  
  try {
    pluginManager.disablePlugin(name);
    logSuccess(`插件已禁用: ${name}`);
  } catch (error) {
    logError(`禁用插件失败: ${error.message}`);
  }
}

// 重载插件
function reloadPlugin(name) {
  if (!name) {
    logError('请指定插件名称');
    return;
  }
  
  try {
    pluginManager.reloadPlugin(name);
    logSuccess(`插件已重载: ${name}`);
  } catch (error) {
    logError(`重载插件失败: ${error.message}`);
  }
}

// 搜索插件
function searchPlugins(query) {
  if (!query) {
    logError('请指定搜索关键词');
    return;
  }
  
  const results = pluginManager.searchPlugins(query);
  
  if (results.length === 0) {
    logInfo(`没有找到匹配的插件: ${query}`);
    return;
  }
  
  logHeader(`搜索结果: ${query}`);
  
  results.forEach(plugin => {
    log(`\n${plugin.name} v${plugin.version}`, 'bright');
    log(`  ${plugin.description}`);
  });
  
  log('');
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  // 加载插件
  loadPlugins();
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    return;
  }
  
  const command = args[0];
  const commandArgs = args.slice(1).filter(arg => !arg.startsWith('--'));
  
  // 检查是否是插件管理命令
  if (command.startsWith('plugin:')) {
    const subCommand = command.substring(7);
    handlePluginManagement(subCommand, commandArgs);
    return;
  }
  
  // 检查是否是插件命令
  const commandPlugin = pluginManager.getPluginsByType(PluginType.COMMAND)
    .find(p => p.name === command && p.enabled);
  
  if (commandPlugin) {
    await executePluginCommand(command, commandArgs);
    return;
  }
  
  // 检查是否是步骤命令
  if (command.startsWith('step')) {
    // 检查是否是插件步骤
    const stepPlugin = pluginManager.getPluginsByType(PluginType.STEP)
      .find(p => command === `step:${p.name}` && p.enabled);
    
    if (stepPlugin) {
      await executePluginStep(stepPlugin.name, { args: commandArgs });
      return;
    }
    
    // 否则执行内置步骤
    executeStep(command, commandArgs);
    return;
  }
  
  // 检查是否是Agent命令
  if (command.startsWith('agent:')) {
    const agentName = command.substring(6);
    
    // 检查是否是插件智能体
    const agentPlugin = pluginManager.getPluginsByType(PluginType.AGENT)
      .find(p => p.name === agentName && p.enabled);
    
    if (agentPlugin) {
      await executePluginAgent(agentName, commandArgs.join(' '));
      return;
    }
    
    // 否则执行内置智能体
    executeAgent(agentName, commandArgs);
    return;
  }
  
  // 执行普通命令
  executeCommand(command, commandArgs);
}

// 错误处理
process.on('uncaughtException', (error) => {
  logError('发生未捕获的异常:');
  logError(error.message);
  if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
    console.error(error);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('发生未处理的Promise拒绝:');
  logError(reason);
  if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
    console.error(promise);
  }
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    logError('程序执行失败');
    if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
      console.error(error);
    }
    process.exit(1);
  });
}

module.exports = {
  executeCommand,
  executeStep,
  executeAgent,
  executePluginCommand,
  executePluginStep,
  executePluginAgent,
  pluginManager,
  COMMANDS,
  STEP_COMMANDS,
  AGENT_COMMANDS
};
