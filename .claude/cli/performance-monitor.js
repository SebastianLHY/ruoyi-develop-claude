#!/usr/bin/env node

/**
 * 性能监控系统
 * 监控CLI工具的执行性能，包括：
 * - 命令执行时间
 * - 步骤执行时间
 * - 智能体执行时间
 * - 插件执行时间
 * - 性能瓶颈分析
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * 性能监控器类
 */
class PerformanceMonitor {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.logDir = options.logDir || path.join(__dirname, '.performance');
    this.logFile = options.logFile || path.join(this.logDir, 'performance.json');
    this.metricsFile = options.metricsFile || path.join(this.logDir, 'metrics.json');
    
    // 性能数据
    this.sessions = new Map();
    this.currentSession = null;
    this.metrics = {
      commands: {},
      steps: {},
      agents: {},
      plugins: {},
      hooks: {}
    };
    
    // 阈值配置
    this.thresholds = {
      command: 30000,      // 30秒
      step: 60000,         // 60秒
      agent: 120000,       // 120秒
      plugin: 10000,       // 10秒
      hook: 1000           // 1秒
    };
    
    this.init();
  }
  
  /**
   * 初始化
   */
  init() {
    if (!this.enabled) return;
    
    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // 加载历史指标
    this.loadMetrics();
  }
  
  /**
   * 开始新会话
   */
  startSession(sessionId = null) {
    if (!this.enabled) return null;
    
    sessionId = sessionId || this.generateSessionId();
    
    const session = {
      id: sessionId,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      operations: [],
      system: this.getSystemInfo(),
      metadata: {}
    };
    
    this.sessions.set(sessionId, session);
    this.currentSession = sessionId;
    
    return sessionId;
  }
  
  /**
   * 结束会话
   */
  endSession(sessionId = null) {
    if (!this.enabled) return;
    
    sessionId = sessionId || this.currentSession;
    const session = this.sessions.get(sessionId);
    
    if (!session) return;
    
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;
    
    // 保存会话数据
    this.saveSession(session);
    
    // 分析性能
    this.analyzeSession(session);
    
    if (this.currentSession === sessionId) {
      this.currentSession = null;
    }
  }
  
  /**
   * 开始操作计时
   */
  startOperation(type, name, metadata = {}) {
    if (!this.enabled) return null;
    
    const operationId = this.generateOperationId();
    const session = this.sessions.get(this.currentSession);
    
    if (!session) {
      console.warn('[Performance] No active session');
      return null;
    }
    
    const operation = {
      id: operationId,
      type: type,
      name: name,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      metadata: metadata,
      children: [],
      parent: null
    };
    
    session.operations.push(operation);
    
    return operationId;
  }
  
  /**
   * 结束操作计时
   */
  endOperation(operationId, result = {}) {
    if (!this.enabled) return;
    
    const session = this.sessions.get(this.currentSession);
    if (!session) return;
    
    const operation = session.operations.find(op => op.id === operationId);
    if (!operation) return;
    
    operation.endTime = Date.now();
    operation.duration = operation.endTime - operation.startTime;
    operation.result = result;
    
    // 更新指标
    this.updateMetrics(operation);
    
    // 检查性能阈值
    this.checkThreshold(operation);
  }
  
  /**
   * 记录智能体协作
   */
  recordAgentCollaboration(agents, startTime, endTime, result = {}) {
    if (!this.enabled) return;
    
    const session = this.sessions.get(this.currentSession);
    if (!session) return;
    
    const collaboration = {
      id: this.generateOperationId(),
      type: 'agent-collaboration',
      agents: agents,
      startTime: startTime,
      endTime: endTime,
      duration: endTime - startTime,
      result: result,
      breakdown: {}
    };
    
    // 计算每个智能体的耗时
    agents.forEach(agent => {
      if (agent.startTime && agent.endTime) {
        collaboration.breakdown[agent.name] = {
          duration: agent.endTime - agent.startTime,
          percentage: ((agent.endTime - agent.startTime) / collaboration.duration * 100).toFixed(2)
        };
      }
    });
    
    session.operations.push(collaboration);
    
    // 更新指标
    this.metrics.agents[`collaboration-${agents.length}`] = 
      this.metrics.agents[`collaboration-${agents.length}`] || { count: 0, totalDuration: 0, avgDuration: 0 };
    
    const metric = this.metrics.agents[`collaboration-${agents.length}`];
    metric.count++;
    metric.totalDuration += collaboration.duration;
    metric.avgDuration = metric.totalDuration / metric.count;
  }
  
  /**
   * 更新指标
   */
  updateMetrics(operation) {
    const category = this.metrics[operation.type + 's'] || {};
    
    if (!category[operation.name]) {
      category[operation.name] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        lastDuration: 0
      };
    }
    
    const metric = category[operation.name];
    metric.count++;
    metric.totalDuration += operation.duration;
    metric.avgDuration = metric.totalDuration / metric.count;
    metric.minDuration = Math.min(metric.minDuration, operation.duration);
    metric.maxDuration = Math.max(metric.maxDuration, operation.duration);
    metric.lastDuration = operation.duration;
    
    this.metrics[operation.type + 's'][operation.name] = metric;
    
    // 保存指标
    this.saveMetrics();
  }
  
  /**
   * 检查性能阈值
   */
  checkThreshold(operation) {
    const threshold = this.thresholds[operation.type];
    
    if (threshold && operation.duration > threshold) {
      console.warn(`[Performance Warning] ${operation.type} "${operation.name}" took ${operation.duration}ms (threshold: ${threshold}ms)`);
      
      // 记录警告
      this.recordWarning({
        type: 'threshold-exceeded',
        operation: operation,
        threshold: threshold,
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * 分析会话性能
   */
  analyzeSession(session) {
    const analysis = {
      sessionId: session.id,
      duration: session.duration,
      operationCount: session.operations.length,
      bottlenecks: [],
      recommendations: []
    };
    
    // 查找性能瓶颈
    session.operations.forEach(op => {
      if (op.duration > this.thresholds[op.type]) {
        analysis.bottlenecks.push({
          type: op.type,
          name: op.name,
          duration: op.duration,
          percentage: (op.duration / session.duration * 100).toFixed(2)
        });
      }
    });
    
    // 排序瓶颈（按耗时降序）
    analysis.bottlenecks.sort((a, b) => b.duration - a.duration);
    
    // 生成优化建议
    analysis.recommendations = this.generateRecommendations(analysis, session);
    
    // 保存分析结果
    session.analysis = analysis;
    
    return analysis;
  }
  
  /**
   * 生成优化建议
   */
  generateRecommendations(analysis, session) {
    const recommendations = [];
    
    // 检查是否有严重的性能瓶颈
    const severeBottlenecks = analysis.bottlenecks.filter(b => b.percentage > 50);
    if (severeBottlenecks.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'bottleneck',
        message: `发现严重性能瓶颈: ${severeBottlenecks.map(b => b.name).join(', ')}`,
        suggestion: '建议优化这些操作的执行逻辑或考虑异步处理'
      });
    }
    
    // 检查智能体协作效率
    const collaborations = session.operations.filter(op => op.type === 'agent-collaboration');
    if (collaborations.length > 0) {
      const avgCollabDuration = collaborations.reduce((sum, c) => sum + c.duration, 0) / collaborations.length;
      if (avgCollabDuration > 60000) {
        recommendations.push({
          priority: 'medium',
          category: 'agent-collaboration',
          message: '智能体协作平均耗时较长',
          suggestion: '考虑并行执行或优化智能体响应时间'
        });
      }
    }
    
    // 检查操作数量
    if (session.operations.length > 50) {
      recommendations.push({
        priority: 'low',
        category: 'operation-count',
        message: '单次会话操作数量较多',
        suggestion: '考虑将复杂任务拆分为多个会话'
      });
    }
    
    return recommendations;
  }
  
  /**
   * 获取性能报告
   */
  getPerformanceReport(options = {}) {
    const report = {
      timestamp: Date.now(),
      summary: this.getSummary(),
      metrics: this.metrics,
      topBottlenecks: this.getTopBottlenecks(options.limit || 10),
      recommendations: this.getRecommendations()
    };
    
    return report;
  }
  
  /**
   * 获取性能摘要
   */
  getSummary() {
    const allSessions = Array.from(this.sessions.values());
    const completedSessions = allSessions.filter(s => s.endTime !== null);
    
    if (completedSessions.length === 0) {
      return {
        totalSessions: 0,
        avgDuration: 0,
        totalOperations: 0
      };
    }
    
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalOperations = completedSessions.reduce((sum, s) => sum + s.operations.length, 0);
    
    return {
      totalSessions: completedSessions.length,
      avgDuration: totalDuration / completedSessions.length,
      totalOperations: totalOperations,
      avgOperationsPerSession: totalOperations / completedSessions.length
    };
  }
  
  /**
   * 获取性能瓶颈Top N
   */
  getTopBottlenecks(limit = 10) {
    const bottlenecks = [];
    
    // 收集所有操作
    Object.entries(this.metrics).forEach(([category, items]) => {
      Object.entries(items).forEach(([name, metric]) => {
        bottlenecks.push({
          category: category,
          name: name,
          avgDuration: metric.avgDuration,
          maxDuration: metric.maxDuration,
          count: metric.count
        });
      });
    });
    
    // 按平均耗时降序排序
    bottlenecks.sort((a, b) => b.avgDuration - a.avgDuration);
    
    return bottlenecks.slice(0, limit);
  }
  
  /**
   * 获取优化建议
   */
  getRecommendations() {
    const recommendations = [];
    
    // 基于指标生成建议
    const topBottlenecks = this.getTopBottlenecks(5);
    
    topBottlenecks.forEach(bottleneck => {
      if (bottleneck.avgDuration > 30000) {
        recommendations.push({
          priority: 'high',
          category: bottleneck.category,
          name: bottleneck.name,
          message: `${bottleneck.name} 平均耗时 ${(bottleneck.avgDuration / 1000).toFixed(2)}秒`,
          suggestion: '建议优化执行逻辑或考虑缓存机制'
        });
      }
    });
    
    return recommendations;
  }
  
  /**
   * 记录警告
   */
  recordWarning(warning) {
    const warningFile = path.join(this.logDir, 'warnings.json');
    let warnings = [];
    
    if (fs.existsSync(warningFile)) {
      try {
        warnings = JSON.parse(fs.readFileSync(warningFile, 'utf-8'));
      } catch (error) {
        // 忽略解析错误
      }
    }
    
    warnings.push(warning);
    
    // 只保留最近100条警告
    if (warnings.length > 100) {
      warnings = warnings.slice(-100);
    }
    
    fs.writeFileSync(warningFile, JSON.stringify(warnings, null, 2));
  }
  
  /**
   * 保存会话数据
   */
  saveSession(session) {
    const sessionFile = path.join(this.logDir, `session-${session.id}.json`);
    fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
    
    // 更新主日志文件
    this.appendToLog({
      type: 'session',
      data: {
        id: session.id,
        duration: session.duration,
        operationCount: session.operations.length,
        timestamp: session.endTime
      }
    });
  }
  
  /**
   * 保存指标
   */
  saveMetrics() {
    fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }
  
  /**
   * 加载指标
   */
  loadMetrics() {
    if (fs.existsSync(this.metricsFile)) {
      try {
        this.metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf-8'));
      } catch (error) {
        console.warn('[Performance] Failed to load metrics:', error.message);
      }
    }
  }
  
  /**
   * 追加日志
   */
  appendToLog(entry) {
    let logs = [];
    
    if (fs.existsSync(this.logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(this.logFile, 'utf-8'));
      } catch (error) {
        // 忽略解析错误
      }
    }
    
    logs.push({
      ...entry,
      timestamp: Date.now()
    });
    
    // 只保留最近1000条日志
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }
    
    fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
  }
  
  /**
   * 获取系统信息
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      nodeVersion: process.version
    };
  }
  
  /**
   * 生成会话ID
   */
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * 生成操作ID
   */
  generateOperationId() {
    return `op-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * 清理旧数据
   */
  cleanup(daysToKeep = 7) {
    if (!fs.existsSync(this.logDir)) return;
    
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;
    
    const files = fs.readdirSync(this.logDir);
    
    files.forEach(file => {
      if (file.startsWith('session-') && file.endsWith('.json')) {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
        }
      }
    });
  }
  
  /**
   * 导出报告
   */
  exportReport(outputFile) {
    const report = this.getPerformanceReport();
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    return outputFile;
  }
  
  /**
   * 打印报告
   */
  printReport() {
    const report = this.getPerformanceReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('性能监控报告');
    console.log('='.repeat(60));
    
    console.log('\n📊 摘要:');
    console.log(`  总会话数: ${report.summary.totalSessions}`);
    console.log(`  平均耗时: ${(report.summary.avgDuration / 1000).toFixed(2)}秒`);
    console.log(`  总操作数: ${report.summary.totalOperations}`);
    
    console.log('\n🐌 性能瓶颈 Top 10:');
    report.topBottlenecks.forEach((bottleneck, index) => {
      console.log(`  ${index + 1}. ${bottleneck.category}/${bottleneck.name}`);
      console.log(`     平均: ${(bottleneck.avgDuration / 1000).toFixed(2)}秒, 最大: ${(bottleneck.maxDuration / 1000).toFixed(2)}秒, 次数: ${bottleneck.count}`);
    });
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 优化建议:');
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
        console.log(`     建议: ${rec.suggestion}`);
      });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// 导出
module.exports = {
  PerformanceMonitor
};
