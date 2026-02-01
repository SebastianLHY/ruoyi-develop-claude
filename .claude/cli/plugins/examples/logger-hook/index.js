/**
 * 日志记录钩子插件
 * 展示如何使用钩子机制
 */

const fs = require('fs');
const path = require('path');

// 插件配置
let config = {
  logFile: '.logs/cli.log',
  logLevel: 'info',
  timestamp: true
};

// 日志级别
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// 插件初始化
function init(globalConfig) {
  console.log('[logger-hook] 日志钩子插件初始化');
  
  // 合并配置
  config = { ...config, ...globalConfig };
  
  // 确保日志目录存在
  const logDir = path.dirname(config.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// 写入日志
function writeLog(level, message, context = {}) {
  const levelName = Object.keys(LogLevel).find(k => LogLevel[k] === level);
  const timestamp = config.timestamp ? new Date().toISOString() : '';
  
  const logEntry = {
    timestamp,
    level: levelName,
    message,
    context
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  
  // 写入文件
  fs.appendFileSync(config.logFile, logLine);
  
  // 控制台输出（仅错误）
  if (level >= LogLevel.ERROR) {
    console.error(`[LOG] ${levelName}: ${message}`);
  }
}

// 钩子定义
const hooks = {
  // 命令执行前
  'before-command': async (context) => {
    writeLog(LogLevel.INFO, 'Command started', {
      plugin: context.plugin,
      args: context.args
    });
  },
  
  // 命令执行后
  'after-command': async (context) => {
    writeLog(LogLevel.INFO, 'Command completed', {
      plugin: context.plugin,
      args: context.args,
      result: context.result
    });
  },
  
  // 步骤执行前
  'before-step': async (context) => {
    writeLog(LogLevel.INFO, 'Step started', {
      plugin: context.plugin,
      context: context.context
    });
  },
  
  // 步骤执行后
  'after-step': async (context) => {
    writeLog(LogLevel.INFO, 'Step completed', {
      plugin: context.plugin,
      context: context.context,
      result: context.result
    });
  },
  
  // 智能体执行前
  'before-agent': async (context) => {
    writeLog(LogLevel.INFO, 'Agent started', {
      plugin: context.plugin,
      task: context.task
    });
  },
  
  // 智能体执行后
  'after-agent': async (context) => {
    writeLog(LogLevel.INFO, 'Agent completed', {
      plugin: context.plugin,
      task: context.task,
      result: context.result
    });
  },
  
  // 错误发生时
  'on-error': async (context) => {
    writeLog(LogLevel.ERROR, 'Error occurred', {
      plugin: context.plugin,
      error: context.error ? context.error.message : 'Unknown error',
      stack: context.error ? context.error.stack : undefined
    });
  },
  
  // 成功完成时
  'on-success': async (context) => {
    writeLog(LogLevel.INFO, 'Execution successful', {
      plugin: context.plugin,
      result: context.result
    });
  }
};

// 获取日志内容
function getLogs(lines = 50) {
  if (!fs.existsSync(config.logFile)) {
    return [];
  }
  
  const content = fs.readFileSync(config.logFile, 'utf-8');
  const logLines = content.trim().split('\n');
  
  return logLines.slice(-lines).map(line => JSON.parse(line));
}

// 清空日志
function clearLogs() {
  if (fs.existsSync(config.logFile)) {
    fs.writeFileSync(config.logFile, '');
  }
}

module.exports = {
  init,
  hooks,
  getLogs,
  clearLogs
};
