/**
 * 自定义智能体示例插件
 * 展示如何创建第三方智能体插件
 */

const fs = require('fs');
const path = require('path');

// 插件配置
let config = {
  model: 'claude-3',
  temperature: 0.7,
  maxTokens: 4096
};

// 插件初始化
function init(globalConfig) {
  console.log('[custom-agent] 智能体插件初始化');
  
  // 合并配置
  config = { ...config, ...globalConfig };
}

// 执行智能体任务
async function execute(task) {
  console.log('[custom-agent] 执行任务:', task);
  
  // 读取智能体配置文件
  const agentFile = path.join(__dirname, 'AGENT.md');
  let agentPrompt = '';
  
  if (fs.existsSync(agentFile)) {
    agentPrompt = fs.readFileSync(agentFile, 'utf-8');
  }
  
  // 构建完整提示词
  const fullPrompt = `
${agentPrompt}

任务: ${task}

请按照上述智能体的职责和工作流程完成此任务。
  `.trim();
  
  console.log('\n智能体提示词:');
  console.log('---');
  console.log(fullPrompt);
  console.log('---\n');
  
  // 这里应该调用Claude API
  // 为了示例，我们直接返回模拟结果
  const result = {
    success: true,
    task: task,
    response: '任务分析完成。这是一个自定义智能体的响应示例。',
    model: config.model,
    tokens: 150
  };
  
  return result;
}

// 获取智能体信息
function getInfo() {
  return {
    name: 'Custom Agent',
    description: '自定义智能体示例',
    capabilities: [
      '任务分析',
      '代码生成',
      '问题解答'
    ],
    model: config.model
  };
}

module.exports = {
  init,
  execute,
  getInfo
};
