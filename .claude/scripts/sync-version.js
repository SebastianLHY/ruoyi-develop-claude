#!/usr/bin/env node

/**
 * 版本号自动同步脚本
 * 
 * 功能：
 * 1. 读取 VERSION.json 中的 current_version
 * 2. 自动更新所有配置的文档文件中的版本号
 * 3. 生成更新报告
 * 
 * 使用方法：
 * node .claude/scripts/sync-version.js
 */

const fs = require('fs');
const path = require('path');

// 读取版本配置
const versionConfigPath = path.join(__dirname, '..', 'VERSION.json');
const versionConfig = JSON.parse(fs.readFileSync(versionConfigPath, 'utf8'));

const currentVersion = versionConfig.current_version;
const lastUpdated = versionConfig.last_updated;
const versionFiles = versionConfig.version_files;

console.log(`\n📦 版本同步工具`);
console.log(`当前版本: ${currentVersion}`);
console.log(`更新日期: ${lastUpdated}`);
console.log(`\n开始同步版本号...\n`);

// 版本号匹配模式
const patterns = [
  // > **版本**: v2.XX
  { regex: /^(>\s*\*\*版本\*\*:\s*)v\d+\.\d+/gm, replacement: `$1${currentVersion}` },
  
  // **版本**: v2.XX
  { regex: /^(\*\*版本\*\*:\s*)v\d+\.\d+/gm, replacement: `$1${currentVersion}` },
  
  // | **v2.XX** |
  { regex: /(\|\s*\*\*)(v\d+\.\d+)(\*\*\s*\|)/gm, replacement: `$1${currentVersion}$3` },
  
  // 版本: v2.XX
  { regex: /^(版本:\s*)v\d+\.\d+/gm, replacement: `$1${currentVersion}` },
  
  // v2.XX (2026-01-29)
  { regex: /(v\d+\.\d+)(\s*\(\d{4}-\d{2}-\d{2}\))/gm, replacement: `${currentVersion}$2` }
];

let updatedCount = 0;
let errorCount = 0;
const updateReport = [];

// 处理每个文件
for (const relativeFilePath of versionFiles) {
  const filePath = path.join(__dirname, '../..', relativeFilePath);
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  跳过: ${relativeFilePath} (文件不存在)`);
      updateReport.push({ file: relativeFilePath, status: 'skipped', reason: '文件不存在' });
      continue;
    }
    
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changeCount = 0;
    
    // 应用所有版本号替换模式
    for (const pattern of patterns) {
      const matches = content.match(pattern.regex);
      if (matches) {
        content = content.replace(pattern.regex, pattern.replacement);
        changeCount += matches.length;
      }
    }
    
    // 如果内容有变化，写回文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已更新: ${relativeFilePath} (${changeCount} 处变更)`);
      updatedCount++;
      updateReport.push({ file: relativeFilePath, status: 'updated', changes: changeCount });
    } else {
      console.log(`⏭️  无需更新: ${relativeFilePath}`);
      updateReport.push({ file: relativeFilePath, status: 'unchanged' });
    }
  } catch (error) {
    console.error(`❌ 错误: ${relativeFilePath} - ${error.message}`);
    errorCount++;
    updateReport.push({ file: relativeFilePath, status: 'error', error: error.message });
  }
}

// 输出统计信息
console.log(`\n📊 同步统计:`);
console.log(`✅ 已更新文件: ${updatedCount}`);
console.log(`⏭️  无需更新: ${versionFiles.length - updatedCount - errorCount}`);
console.log(`❌ 错误: ${errorCount}`);

// 生成更新报告
const reportPath = path.join(__dirname, '..', 'VERSION_SYNC_REPORT.json');
const report = {
  sync_time: new Date().toISOString(),
  version: currentVersion,
  updated_date: lastUpdated,
  summary: {
    total_files: versionFiles.length,
    updated: updatedCount,
    unchanged: versionFiles.length - updatedCount - errorCount,
    errors: errorCount
  },
  details: updateReport
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`\n📄 更新报告已保存: ${reportPath}`);

console.log(`\n✨ 版本同步完成！`);

// 如果有错误，退出码为1
process.exit(errorCount > 0 ? 1 : 0);
