/**
 * 性能监控钩子插件
 * 自动监控所有命令、步骤和智能体的执行性能
 */

const path = require('path');
const { PerformanceMonitor } = require('../../../performance-monitor');

// 性能监控器实例
let monitor = null;

// 操作栈（用于跟踪嵌套操作）
const operationStack = new Map();

/**
 * 初始化插件
 */
function init(config) {
  console.log('[performance-monitor] 性能监控插件初始化');
  
  // 创建性能监控器
  monitor = new PerformanceMonitor({
    enabled: config.enabled !== false,
    logDir: config.logDir || path.join(__dirname, '../../../.performance'),
    ...config
  });
  
  // 启动会话
  monitor.startSession();
  
  // 如果启用自动报告
  if (config.autoReport) {
    const interval = config.reportInterval || 3600000; // 默认1小时
    setInterval(() => {
      monitor.printReport();
    }, interval);
  }
}

/**
 * 钩子定义
 */
const hooks = {
  /**
   * 命令执行前
   */
  'before-command': async (context) => {
    if (!monitor) return;
    
    const operationId = monitor.startOperation('command', context.plugin, {
      args: context.args
    });
    
    operationStack.set(`command-${context.plugin}`, {
      operationId,
      startTime: Date.now()
    });
  },
  
  /**
   * 命令执行后
   */
  'after-command': async (context) => {
    if (!monitor) return;
    
    const key = `command-${context.plugin}`;
    const operation = operationStack.get(key);
    
    if (operation) {
      monitor.endOperation(operation.operationId, {
        success: context.result?.success,
        ...context.result
      });
      
      operationStack.delete(key);
    }
  },
  
  /**
   * 步骤执行前
   */
  'before-step': async (context) => {
    if (!monitor) return;
    
    const operationId = monitor.startOperation('step', context.plugin, {
      context: context.context
    });
    
    operationStack.set(`step-${context.plugin}`, {
      operationId,
      startTime: Date.now()
    });
  },
  
  /**
   * 步骤执行后
   */
  'after-step': async (context) => {
    if (!monitor) return;
    
    const key = `step-${context.plugin}`;
    const operation = operationStack.get(key);
    
    if (operation) {
      monitor.endOperation(operation.operationId, {
        success: context.result?.success,
        steps: context.result?.steps?.length || 0,
        ...context.result
      });
      
      operationStack.delete(key);
    }
  },
  
  /**
   * 智能体执行前
   */
  'before-agent': async (context) => {
    if (!monitor) return;
    
    const operationId = monitor.startOperation('agent', context.plugin, {
      task: context.task
    });
    
    operationStack.set(`agent-${context.plugin}`, {
      operationId,
      startTime: Date.now(),
      agentName: context.plugin
    });
  },
  
  /**
   * 智能体执行后
   */
  'after-agent': async (context) => {
    if (!monitor) return;
    
    const key = `agent-${context.plugin}`;
    const operation = operationStack.get(key);
    
    if (operation) {
      monitor.endOperation(operation.operationId, {
        success: context.result?.success,
        task: context.task,
        ...context.result
      });
      
      operationStack.delete(key);
    }
  },
  
  /**
   * 错误发生时
   */
  'on-error': async (context) => {
    if (!monitor) return;
    
    // 记录错误
    monitor.recordWarning({
      type: 'error',
      plugin: context.plugin,
      error: context.error?.message || 'Unknown error',
      timestamp: Date.now()
    });
  },
  
  /**
   * 成功完成时
   */
  'on-success': async (context) => {
    if (!monitor) return;
    
    // 可以在这里记录成功的额外信息
  }
};

/**
 * 启用插件
 */
function enable() {
  console.log('[performance-monitor] 性能监控已启用');
}

/**
 * 禁用插件
 */
function disable() {
  console.log('[performance-monitor] 性能监控已禁用');
  
  if (monitor) {
    // 结束当前会话
    monitor.endSession();
    
    // 打印报告
    monitor.printReport();
  }
}

/**
 * 清理资源
 */
function cleanup() {
  console.log('[performance-monitor] 性能监控清理完成');
  
  if (monitor) {
    monitor.endSession();
    monitor.cleanup(7); // 清理7天前的数据
  }
}

/**
 * 获取监控器实例（供外部调用）
 */
function getMonitor() {
  return monitor;
}

/**
 * 打印性能报告
 */
function printReport() {
  if (monitor) {
    monitor.printReport();
  }
}

/**
 * 导出报告
 */
function exportReport(outputFile) {
  if (monitor) {
    return monitor.exportReport(outputFile);
  }
  return null;
}

module.exports = {
  init,
  hooks,
  enable,
  disable,
  cleanup,
  getMonitor,
  printReport,
  exportReport
};
