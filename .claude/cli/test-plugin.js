#!/usr/bin/env node

/**
 * 插件系统测试脚本
 * 用于验证插件系统的各项功能
 */

const fs = require('fs');
const path = require('path');
const { PluginManager, PluginType, PluginStatus } = require('./plugin-manager');

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

function logTest(name) {
  log(`\n测试: ${name}`, 'cyan');
}

function logPass(message) {
  log(`  ✓ ${message}`, 'green');
}

function logFail(message) {
  log(`  ✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ℹ ${message}`, 'blue');
}

// 测试计数
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, testFn) {
  totalTests++;
  logTest(name);
  
  try {
    testFn();
    passedTests++;
    logPass('测试通过');
    return true;
  } catch (error) {
    failedTests++;
    logFail(`测试失败: ${error.message}`);
    return false;
  }
}

// 异步测试
async function runAsyncTest(name, testFn) {
  totalTests++;
  logTest(name);
  
  try {
    await testFn();
    passedTests++;
    logPass('测试通过');
    return true;
  } catch (error) {
    failedTests++;
    logFail(`测试失败: ${error.message}`);
    return false;
  }
}

// 测试插件管理器
const pluginDir = path.join(__dirname, 'plugins', 'examples');
const pluginManager = new PluginManager(pluginDir);

// 测试1: 插件目录存在
runTest('检查插件目录', () => {
  if (!fs.existsSync(pluginDir)) {
    throw new Error('插件目录不存在');
  }
  logInfo(`插件目录: ${pluginDir}`);
});

// 测试2: 加载插件
runTest('加载插件', () => {
  const plugins = pluginManager.loadPlugins();
  
  if (plugins.size === 0) {
    throw new Error('没有加载到任何插件');
  }
  
  logInfo(`已加载 ${plugins.size} 个插件`);
  
  plugins.forEach((plugin, name) => {
    logInfo(`  - ${name} v${plugin.version} (${plugin.type})`);
  });
});

// 测试3: 获取所有插件
runTest('获取所有插件', () => {
  const plugins = pluginManager.getAllPlugins();
  
  if (plugins.length === 0) {
    throw new Error('没有获取到任何插件');
  }
  
  logInfo(`获取到 ${plugins.length} 个插件`);
});

// 测试4: 按类型获取插件
runTest('按类型获取插件', () => {
  const commandPlugins = pluginManager.getPluginsByType(PluginType.COMMAND);
  const stepPlugins = pluginManager.getPluginsByType(PluginType.STEP);
  const agentPlugins = pluginManager.getPluginsByType(PluginType.AGENT);
  const hookPlugins = pluginManager.getPluginsByType(PluginType.HOOK);
  
  logInfo(`命令插件: ${commandPlugins.length}`);
  logInfo(`步骤插件: ${stepPlugins.length}`);
  logInfo(`智能体插件: ${agentPlugins.length}`);
  logInfo(`钩子插件: ${hookPlugins.length}`);
  
  if (commandPlugins.length + stepPlugins.length + agentPlugins.length + hookPlugins.length === 0) {
    throw new Error('没有找到任何类型的插件');
  }
});

// 测试5: 获取插件信息
runTest('获取插件信息', () => {
  const plugins = pluginManager.getAllPlugins();
  
  if (plugins.length === 0) {
    throw new Error('没有可用的插件');
  }
  
  const plugin = plugins[0];
  const info = pluginManager.getPluginInfo(plugin.name);
  
  if (!info) {
    throw new Error('无法获取插件信息');
  }
  
  logInfo(`插件名称: ${info.name}`);
  logInfo(`插件版本: ${info.version}`);
  logInfo(`插件类型: ${info.type}`);
  logInfo(`插件状态: ${info.status}`);
});

// 测试6: 启用/禁用插件
runTest('启用/禁用插件', () => {
  const plugins = pluginManager.getAllPlugins();
  
  if (plugins.length === 0) {
    throw new Error('没有可用的插件');
  }
  
  const plugin = plugins[0];
  
  // 禁用
  pluginManager.disablePlugin(plugin.name);
  const disabledPlugin = pluginManager.getPlugin(plugin.name);
  
  if (disabledPlugin.enabled) {
    throw new Error('插件禁用失败');
  }
  
  logInfo(`已禁用: ${plugin.name}`);
  
  // 启用
  pluginManager.enablePlugin(plugin.name);
  const enabledPlugin = pluginManager.getPlugin(plugin.name);
  
  if (!enabledPlugin.enabled) {
    throw new Error('插件启用失败');
  }
  
  logInfo(`已启用: ${plugin.name}`);
});

// 测试7: 列出插件
runTest('列出插件', () => {
  const list = pluginManager.listPlugins();
  
  if (list.length === 0) {
    throw new Error('插件列表为空');
  }
  
  logInfo(`插件列表包含 ${list.length} 个插件`);
  
  list.forEach(plugin => {
    logInfo(`  - ${plugin.name}: ${plugin.enabled ? '已启用' : '已禁用'}`);
  });
});

// 测试8: 搜索插件
runTest('搜索插件', () => {
  const results = pluginManager.searchPlugins('hello');
  
  logInfo(`搜索 "hello" 找到 ${results.length} 个结果`);
  
  results.forEach(plugin => {
    logInfo(`  - ${plugin.name}`);
  });
});

// 测试9: 执行命令插件（异步）
runAsyncTest('执行命令插件', async () => {
  const commandPlugins = pluginManager.getPluginsByType(PluginType.COMMAND);
  
  if (commandPlugins.length === 0) {
    throw new Error('没有可用的命令插件');
  }
  
  const plugin = commandPlugins[0];
  logInfo(`执行插件: ${plugin.name}`);
  
  const result = await pluginManager.executeCommandPlugin(plugin.name, ['test']);
  
  if (!result) {
    throw new Error('插件执行无返回结果');
  }
  
  logInfo(`执行结果: ${result.success ? '成功' : '失败'}`);
}).catch(() => {
  // 异步测试错误已在runAsyncTest中处理
});

// 测试10: 执行步骤插件（异步）
runAsyncTest('执行步骤插件', async () => {
  const stepPlugins = pluginManager.getPluginsByType(PluginType.STEP);
  
  if (stepPlugins.length === 0) {
    logInfo('没有可用的步骤插件，跳过测试');
    return;
  }
  
  const plugin = stepPlugins[0];
  logInfo(`执行插件: ${plugin.name}`);
  
  const result = await pluginManager.executeStepPlugin(plugin.name, { test: true });
  
  if (!result) {
    throw new Error('插件执行无返回结果');
  }
  
  logInfo(`执行结果: ${result.success ? '成功' : '失败'}`);
}).catch(() => {
  // 异步测试错误已在runAsyncTest中处理
});

// 测试11: 执行智能体插件（异步）
runAsyncTest('执行智能体插件', async () => {
  const agentPlugins = pluginManager.getPluginsByType(PluginType.AGENT);
  
  if (agentPlugins.length === 0) {
    logInfo('没有可用的智能体插件，跳过测试');
    return;
  }
  
  const plugin = agentPlugins[0];
  logInfo(`执行插件: ${plugin.name}`);
  
  const result = await pluginManager.executeAgentPlugin(plugin.name, '测试任务');
  
  if (!result) {
    throw new Error('插件执行无返回结果');
  }
  
  logInfo(`执行结果: ${result.success ? '成功' : '失败'}`);
}).catch(() => {
  // 异步测试错误已在runAsyncTest中处理
});

// 测试12: 钩子系统（异步）
runAsyncTest('测试钩子系统', async () => {
  const hookPlugins = pluginManager.getPluginsByType(PluginType.HOOK);
  
  if (hookPlugins.length === 0) {
    logInfo('没有可用的钩子插件，跳过测试');
    return;
  }
  
  logInfo(`找到 ${hookPlugins.length} 个钩子插件`);
  
  // 执行before-command钩子
  await pluginManager.executeHook('before-command', {
    plugin: 'test',
    args: ['test']
  });
  
  logInfo('before-command钩子执行成功');
  
  // 执行after-command钩子
  await pluginManager.executeHook('after-command', {
    plugin: 'test',
    args: ['test'],
    result: { success: true }
  });
  
  logInfo('after-command钩子执行成功');
}).catch(() => {
  // 异步测试错误已在runAsyncTest中处理
});

// 等待异步测试完成后输出结果
setTimeout(() => {
  log('\n' + '='.repeat(60), 'cyan');
  log('插件系统测试结果', 'bright');
  log('='.repeat(60), 'cyan');
  log(`总测试数: ${totalTests}`, 'blue');
  log(`通过: ${passedTests}`, 'green');
  log(`失败: ${failedTests}`, 'red');
  log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`, 'yellow');
  
  if (failedTests === 0) {
    log('\n✓ 所有测试通过！', 'green');
    process.exit(0);
  } else {
    log('\n✗ 部分测试失败，请检查错误信息', 'red');
    process.exit(1);
  }
}, 2000); // 等待2秒让异步测试完成
