/**
 * 性能分析CLI命令插件
 * 提供性能数据查看和分析功能
 */

const fs = require('fs');
const path = require('path');

// 性能数据目录
const perfDir = path.join(__dirname, '../../../.performance');

/**
 * 初始化插件
 */
function init(config) {
  console.log('[performance-cli] 性能分析CLI插件初始化');
}

/**
 * 执行命令
 */
async function execute(args) {
  const subcommand = args[0] || 'report';
  const options = parseOptions(args.slice(1));
  
  switch (subcommand) {
    case 'report':
      return await showReport(options);
    case 'bottlenecks':
      return await showBottlenecks(options);
    case 'agents':
      return await showAgentStats(options);
    case 'export':
      return await exportData(options);
    case 'clean':
      return await cleanData(options);
    case 'reset':
      return await resetData(options);
    default:
      return {
        success: false,
        error: `未知子命令: ${subcommand}`
      };
  }
}

/**
 * 显示性能报告
 */
async function showReport(options) {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 性能监控报告');
  console.log('='.repeat(70));
  
  try {
    // 读取指标数据
    const metrics = loadMetrics();
    
    if (!metrics || Object.keys(metrics).length === 0) {
      console.log('\n暂无性能数据');
      return { success: true, message: '暂无性能数据' };
    }
    
    // 显示摘要
    showSummary(metrics);
    
    // 显示各类操作统计
    showCommandStats(metrics.commands);
    showStepStats(metrics.steps);
    showAgentStats(metrics.agents);
    showPluginStats(metrics.plugins);
    
    console.log('='.repeat(70) + '\n');
    
    return {
      success: true,
      message: '性能报告显示完成'
    };
  } catch (error) {
    console.error('生成报告失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 显示摘要
 */
function showSummary(metrics) {
  console.log('\n📊 总体摘要:');
  
  let totalOps = 0;
  let totalDuration = 0;
  
  Object.values(metrics).forEach(category => {
    if (typeof category === 'object') {
      Object.values(category).forEach(metric => {
        if (metric.count) {
          totalOps += metric.count;
          totalDuration += metric.totalDuration;
        }
      });
    }
  });
  
  console.log(`  总操作数: ${totalOps}`);
  console.log(`  总耗时: ${formatDuration(totalDuration)}`);
  if (totalOps > 0) {
    console.log(`  平均耗时: ${formatDuration(totalDuration / totalOps)}`);
  }
}

/**
 * 显示命令统计
 */
function showCommandStats(commands) {
  if (!commands || Object.keys(commands).length === 0) return;
  
  console.log('\n📝 命令执行统计:');
  console.log('  ' + '-'.repeat(66));
  console.log('  命令名称                  次数    平均耗时    最大耗时    最小耗时');
  console.log('  ' + '-'.repeat(66));
  
  Object.entries(commands).forEach(([name, metric]) => {
    console.log(
      `  ${name.padEnd(24)} ${metric.count.toString().padStart(4)}  ` +
      `${formatDuration(metric.avgDuration).padStart(10)}  ` +
      `${formatDuration(metric.maxDuration).padStart(10)}  ` +
      `${formatDuration(metric.minDuration).padStart(10)}`
    );
  });
}

/**
 * 显示步骤统计
 */
function showStepStats(steps) {
  if (!steps || Object.keys(steps).length === 0) return;
  
  console.log('\n🔧 步骤执行统计:');
  console.log('  ' + '-'.repeat(66));
  console.log('  步骤名称                  次数    平均耗时    最大耗时    最小耗时');
  console.log('  ' + '-'.repeat(66));
  
  Object.entries(steps).forEach(([name, metric]) => {
    console.log(
      `  ${name.padEnd(24)} ${metric.count.toString().padStart(4)}  ` +
      `${formatDuration(metric.avgDuration).padStart(10)}  ` +
      `${formatDuration(metric.maxDuration).padStart(10)}  ` +
      `${formatDuration(metric.minDuration).padStart(10)}`
    );
  });
}

/**
 * 显示智能体统计
 */
function showAgentStats(agents) {
  if (!agents || Object.keys(agents).length === 0) return;
  
  console.log('\n🤖 智能体执行统计:');
  console.log('  ' + '-'.repeat(66));
  console.log('  智能体名称                次数    平均耗时    最大耗时    最小耗时');
  console.log('  ' + '-'.repeat(66));
  
  Object.entries(agents).forEach(([name, metric]) => {
    console.log(
      `  ${name.padEnd(24)} ${metric.count.toString().padStart(4)}  ` +
      `${formatDuration(metric.avgDuration).padStart(10)}  ` +
      `${formatDuration(metric.maxDuration).padStart(10)}  ` +
      `${formatDuration(metric.minDuration).padStart(10)}`
    );
  });
}

/**
 * 显示插件统计
 */
function showPluginStats(plugins) {
  if (!plugins || Object.keys(plugins).length === 0) return;
  
  console.log('\n🔌 插件执行统计:');
  console.log('  ' + '-'.repeat(66));
  console.log('  插件名称                  次数    平均耗时    最大耗时    最小耗时');
  console.log('  ' + '-'.repeat(66));
  
  Object.entries(plugins).forEach(([name, metric]) => {
    console.log(
      `  ${name.padEnd(24)} ${metric.count.toString().padStart(4)}  ` +
      `${formatDuration(metric.avgDuration).padStart(10)}  ` +
      `${formatDuration(metric.maxDuration).padStart(10)}  ` +
      `${formatDuration(metric.minDuration).padStart(10)}`
    );
  });
}

/**
 * 显示性能瓶颈
 */
async function showBottlenecks(options) {
  console.log('\n' + '='.repeat(70));
  console.log('🐌 性能瓶颈分析');
  console.log('='.repeat(70));
  
  try {
    const metrics = loadMetrics();
    const limit = parseInt(options.limit) || 10;
    
    // 收集所有操作
    const operations = [];
    
    Object.entries(metrics).forEach(([category, items]) => {
      if (typeof items === 'object') {
        Object.entries(items).forEach(([name, metric]) => {
          if (metric.avgDuration) {
            operations.push({
              category: category,
              name: name,
              avgDuration: metric.avgDuration,
              maxDuration: metric.maxDuration,
              count: metric.count
            });
          }
        });
      }
    });
    
    // 按平均耗时降序排序
    operations.sort((a, b) => b.avgDuration - a.avgDuration);
    
    // 显示Top N
    console.log(`\n🔝 Top ${limit} 性能瓶颈:`);
    console.log('  ' + '-'.repeat(66));
    console.log('  类型/名称                            平均耗时    最大耗时    次数');
    console.log('  ' + '-'.repeat(66));
    
    operations.slice(0, limit).forEach((op, index) => {
      console.log(
        `  ${(index + 1).toString().padStart(2)}. ${op.category}/${op.name}`.padEnd(40) +
        `${formatDuration(op.avgDuration).padStart(10)}  ` +
        `${formatDuration(op.maxDuration).padStart(10)}  ` +
        `${op.count.toString().padStart(4)}`
      );
    });
    
    // 生成优化建议
    console.log('\n💡 优化建议:');
    operations.slice(0, 3).forEach((op, index) => {
      if (op.avgDuration > 30000) {
        console.log(`  ${index + 1}. ${op.category}/${op.name}`);
        console.log(`     平均耗时 ${formatDuration(op.avgDuration)}，建议优化执行逻辑`);
      }
    });
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    return {
      success: true,
      bottlenecks: operations.slice(0, limit)
    };
  } catch (error) {
    console.error('分析瓶颈失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 导出性能数据
 */
async function exportData(options) {
  const outputFile = options.output || `performance-report-${Date.now()}.json`;
  const format = options.format || 'json';
  
  try {
    const metrics = loadMetrics();
    const sessions = loadSessions();
    
    const data = {
      timestamp: new Date().toISOString(),
      metrics: metrics,
      sessions: sessions.slice(-10) // 最近10个会话
    };
    
    let content;
    
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
    } else if (format === 'text') {
      content = formatAsText(data);
    } else if (format === 'html') {
      content = formatAsHtml(data);
    } else {
      throw new Error(`不支持的格式: ${format}`);
    }
    
    fs.writeFileSync(outputFile, content);
    
    console.log(`✓ 性能数据已导出到: ${outputFile}`);
    
    return {
      success: true,
      outputFile: outputFile
    };
  } catch (error) {
    console.error('导出数据失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 清理旧数据
 */
async function cleanData(options) {
  const days = parseInt(options.days) || 7;
  
  try {
    if (!fs.existsSync(perfDir)) {
      console.log('性能数据目录不存在');
      return { success: true, message: '无需清理' };
    }
    
    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000;
    let cleaned = 0;
    
    const files = fs.readdirSync(perfDir);
    
    files.forEach(file => {
      if (file.startsWith('session-') && file.endsWith('.json')) {
        const filePath = path.join(perfDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      }
    });
    
    console.log(`✓ 已清理 ${cleaned} 个旧会话文件（${days}天前）`);
    
    return {
      success: true,
      cleaned: cleaned
    };
  } catch (error) {
    console.error('清理数据失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 重置所有数据
 */
async function resetData(options) {
  try {
    if (!fs.existsSync(perfDir)) {
      console.log('性能数据目录不存在');
      return { success: true, message: '无需重置' };
    }
    
    // 删除所有文件
    const files = fs.readdirSync(perfDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(perfDir, file));
    });
    
    console.log(`✓ 已重置所有性能数据`);
    
    return {
      success: true,
      message: '数据已重置'
    };
  } catch (error) {
    console.error('重置数据失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 加载指标
 */
function loadMetrics() {
  const metricsFile = path.join(perfDir, 'metrics.json');
  
  if (!fs.existsSync(metricsFile)) {
    return {};
  }
  
  try {
    return JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
  } catch (error) {
    console.error('加载指标失败:', error.message);
    return {};
  }
}

/**
 * 加载会话
 */
function loadSessions() {
  if (!fs.existsSync(perfDir)) {
    return [];
  }
  
  const sessions = [];
  const files = fs.readdirSync(perfDir);
  
  files.forEach(file => {
    if (file.startsWith('session-') && file.endsWith('.json')) {
      try {
        const session = JSON.parse(fs.readFileSync(path.join(perfDir, file), 'utf-8'));
        sessions.push(session);
      } catch (error) {
        // 忽略损坏的文件
      }
    }
  });
  
  return sessions;
}

/**
 * 解析选项
 */
function parseOptions(args) {
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      options[key] = value;
      if (value !== true) i++;
    }
  }
  
  return options;
}

/**
 * 格式化时长
 */
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m${seconds}s`;
  }
}

/**
 * 格式化为文本
 */
function formatAsText(data) {
  let text = '性能监控报告\n';
  text += '=' .repeat(50) + '\n\n';
  text += `生成时间: ${data.timestamp}\n\n`;
  
  // 添加指标
  text += '指标统计:\n';
  text += JSON.stringify(data.metrics, null, 2);
  
  return text;
}

/**
 * 格式化为HTML
 */
function formatAsHtml(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>性能监控报告</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>性能监控报告</h1>
  <p>生成时间: ${data.timestamp}</p>
  <h2>指标统计</h2>
  <pre>${JSON.stringify(data.metrics, null, 2)}</pre>
</body>
</html>
  `;
}

module.exports = {
  init,
  execute
};
