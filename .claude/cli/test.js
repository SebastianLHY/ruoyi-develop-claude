#!/usr/bin/env node

/**
 * CLI工具测试脚本
 * 用于验证CLI工具的各项功能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// 测试1: 检查文件存在性
runTest('检查CLI文件存在性', () => {
  const files = [
    'cli.js',
    'package.json',
    'jdc.bat',
    'jdc.sh',
    'README.md'
  ];
  
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${file}`);
    }
    logInfo(`文件存在: ${file}`);
  });
});

// 测试2: 检查命令文件存在性
runTest('检查命令文件存在性', () => {
  const commandsDir = path.join(__dirname, '..', 'commands');
  
  const commandFiles = [
    'start.md',
    'check.md',
    'progress.md',
    'next.md',
    'reset.md',
    'init-docs.md',
    'update-status.md',
    'update-todo.md',
    'dev.md',
    'dev-steps.md',
    'dev-dependency-check.md',
    'dev-faq.md',
    'QUICK-START.md'
  ];
  
  commandFiles.forEach(file => {
    const filePath = path.join(commandsDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`命令文件不存在: ${file}`);
    }
    logInfo(`命令文件存在: ${file}`);
  });
});

// 测试3: 检查智能体文件存在性
runTest('检查智能体文件存在性', () => {
  const agentsDir = path.join(__dirname, '..', 'agents');
  
  const agentDirs = [
    'requirements-analyst',
    'code-generator',
    'ui-generator',
    'test-engineer',
    'quality-inspector',
    'bug-detective',
    'code-reviewer',
    'git-workflow-manager',
    'project-manager',
    'deployment-assistant',
    'release-manager'
  ];
  
  agentDirs.forEach(dir => {
    const agentFile = path.join(agentsDir, dir, 'AGENT.md');
    if (!fs.existsSync(agentFile)) {
      throw new Error(`智能体文件不存在: ${dir}/AGENT.md`);
    }
    logInfo(`智能体文件存在: ${dir}/AGENT.md`);
  });
});

// 测试4: 测试帮助命令
runTest('测试帮助命令', () => {
  try {
    const output = execSync('node cli.js --help', {
      cwd: __dirname,
      encoding: 'utf-8'
    });
    
    if (!output.includes('Java Development Claude CLI Tool')) {
      throw new Error('帮助信息格式不正确');
    }
    
    logInfo('帮助命令输出正常');
  } catch (error) {
    throw new Error(`帮助命令执行失败: ${error.message}`);
  }
});

// 测试5: 测试dry-run模式
runTest('测试dry-run模式', () => {
  try {
    const output = execSync('node cli.js start --dry-run', {
      cwd: __dirname,
      encoding: 'utf-8'
    });
    
    if (!output.includes('Dry Run 模式')) {
      throw new Error('dry-run模式未正确工作');
    }
    
    logInfo('dry-run模式正常');
  } catch (error) {
    throw new Error(`dry-run模式测试失败: ${error.message}`);
  }
});

// 测试6: 测试命令映射
runTest('测试命令映射', () => {
  const cli = require('./cli.js');
  
  const expectedCommands = [
    'start', 'check', 'progress', 'next', 'reset',
    'init-docs', 'update-status', 'update-todo',
    'dependency-check', 'dev', 'quick-start', 'faq', 'crud'
  ];
  
  expectedCommands.forEach(cmd => {
    if (!cli.COMMANDS[cmd]) {
      throw new Error(`命令映射缺失: ${cmd}`);
    }
    logInfo(`命令映射存在: ${cmd}`);
  });
});

// 测试7: 测试步骤命令映射
runTest('测试步骤命令映射', () => {
  const cli = require('./cli.js');
  
  const expectedSteps = [
    'step1', 'step2', 'step3', 'step4', 'step5',
    'step5.5', 'step6', 'step7', 'step8', 'step9',
    'step10', 'step11'
  ];
  
  expectedSteps.forEach(step => {
    if (!cli.STEP_COMMANDS[step]) {
      throw new Error(`步骤命令映射缺失: ${step}`);
    }
    logInfo(`步骤命令映射存在: ${step}`);
  });
});

// 测试8: 测试智能体命令映射
runTest('测试智能体命令映射', () => {
  const cli = require('./cli.js');
  
  const expectedAgents = [
    'requirements-analyst', 'code-generator', 'ui-generator',
    'test-engineer', 'quality-inspector', 'bug-detective',
    'code-reviewer', 'git-workflow-manager', 'project-manager',
    'deployment-assistant', 'release-manager'
  ];
  
  expectedAgents.forEach(agent => {
    if (!cli.AGENT_COMMANDS[agent]) {
      throw new Error(`智能体命令映射缺失: ${agent}`);
    }
    logInfo(`智能体命令映射存在: ${agent}`);
  });
});

// 测试9: 测试package.json格式
runTest('测试package.json格式', () => {
  const packageJson = require('./package.json');
  
  if (!packageJson.name) {
    throw new Error('package.json缺少name字段');
  }
  
  if (!packageJson.version) {
    throw new Error('package.json缺少version字段');
  }
  
  if (!packageJson.bin || !packageJson.bin.jdc) {
    throw new Error('package.json缺少bin配置');
  }
  
  logInfo(`包名: ${packageJson.name}`);
  logInfo(`版本: ${packageJson.version}`);
  logInfo(`可执行文件: ${packageJson.bin.jdc}`);
});

// 测试10: 测试脚本权限 (仅Linux/Mac)
if (process.platform !== 'win32') {
  runTest('测试脚本权限', () => {
    const scriptPath = path.join(__dirname, 'jdc.sh');
    const stats = fs.statSync(scriptPath);
    const mode = stats.mode;
    
    // 检查是否有执行权限
    const hasExecutePermission = (mode & 0o111) !== 0;
    
    if (!hasExecutePermission) {
      logInfo('脚本缺少执行权限，尝试添加...');
      try {
        fs.chmodSync(scriptPath, 0o755);
        logInfo('执行权限已添加');
      } catch (error) {
        throw new Error(`无法添加执行权限: ${error.message}`);
      }
    } else {
      logInfo('脚本具有执行权限');
    }
  });
}

// 输出测试结果
log('\n' + '='.repeat(60), 'cyan');
log('测试结果汇总', 'bright');
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
