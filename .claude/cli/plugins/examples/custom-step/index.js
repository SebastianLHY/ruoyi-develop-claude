/**
 * 自定义步骤示例插件
 * 展示如何创建自定义开发步骤
 */

const fs = require('fs');
const path = require('path');

// 插件配置
let config = {
  checkDependencies: true,
  autoBackup: true,
  timeout: 30000
};

// 插件初始化
function init(globalConfig) {
  console.log('[custom-step] 自定义步骤插件初始化');
  
  // 合并配置
  config = { ...config, ...globalConfig };
}

// 执行步骤
async function execute(context) {
  console.log('[custom-step] 执行自定义步骤');
  console.log('上下文:', context);
  
  const results = {
    success: true,
    steps: []
  };
  
  // 步骤1: 检查前置依赖
  if (config.checkDependencies) {
    console.log('\n[1/4] 检查前置依赖...');
    const depCheck = await checkDependencies(context);
    results.steps.push(depCheck);
    
    if (!depCheck.success) {
      results.success = false;
      return results;
    }
  }
  
  // 步骤2: 备份（如果启用）
  if (config.autoBackup) {
    console.log('\n[2/4] 创建备份...');
    const backup = await createBackup(context);
    results.steps.push(backup);
  }
  
  // 步骤3: 执行主要逻辑
  console.log('\n[3/4] 执行主要逻辑...');
  const mainResult = await executeMainLogic(context);
  results.steps.push(mainResult);
  
  if (!mainResult.success) {
    results.success = false;
    
    // 如果失败且有备份，提示恢复
    if (config.autoBackup) {
      console.log('\n提示: 可以使用备份恢复');
    }
    
    return results;
  }
  
  // 步骤4: 验证结果
  console.log('\n[4/4] 验证结果...');
  const validation = await validateResult(context, mainResult);
  results.steps.push(validation);
  
  if (!validation.success) {
    results.success = false;
  }
  
  console.log('\n自定义步骤完成!');
  
  return results;
}

// 检查依赖
async function checkDependencies(context) {
  console.log('  - 检查前置步骤是否完成...');
  console.log('  - 检查必需文件是否存在...');
  console.log('  - 检查环境变量配置...');
  
  // 模拟检查
  await sleep(500);
  
  return {
    name: 'dependency-check',
    success: true,
    message: '依赖检查通过'
  };
}

// 创建备份
async function createBackup(context) {
  console.log('  - 创建文件备份...');
  console.log('  - 备份位置: .backup/');
  
  // 模拟备份
  await sleep(500);
  
  return {
    name: 'backup',
    success: true,
    message: '备份创建成功',
    backupPath: '.backup/'
  };
}

// 执行主要逻辑
async function executeMainLogic(context) {
  console.log('  - 执行自定义步骤逻辑...');
  console.log('  - 处理输入数据...');
  console.log('  - 生成输出结果...');
  
  // 模拟执行
  await sleep(1000);
  
  return {
    name: 'main-logic',
    success: true,
    message: '主要逻辑执行成功',
    output: {
      files: ['output1.txt', 'output2.txt'],
      summary: '处理完成'
    }
  };
}

// 验证结果
async function validateResult(context, mainResult) {
  console.log('  - 验证输出文件...');
  console.log('  - 验证数据完整性...');
  console.log('  - 验证格式正确性...');
  
  // 模拟验证
  await sleep(500);
  
  return {
    name: 'validation',
    success: true,
    message: '结果验证通过'
  };
}

// 辅助函数: 睡眠
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 获取步骤信息
function getInfo() {
  return {
    name: 'Custom Step',
    description: '自定义开发步骤',
    phase: 'custom',
    order: 100,
    dependencies: [],
    outputs: ['output files', 'validation results']
  };
}

module.exports = {
  init,
  execute,
  getInfo
};
