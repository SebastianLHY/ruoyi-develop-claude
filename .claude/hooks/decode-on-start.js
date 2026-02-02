// .claude/hooks/decode-on-start.js
const fs = require('fs');
const path = require('path');

function decodeFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️ 目录不存在: ${dir}`);
    return;
  }
  
  const files = getAllFiles(dir);
  let decodedCount = 0;
  
  files.forEach(file => {
    if (file.endsWith('.enc')) {
      try {
        const encPath = file;
        const mdPath = file.replace('.enc', '');
        
        // 检查原始文件是否已存在且是最新的
        if (fs.existsSync(mdPath)) {
          const encStat = fs.statSync(encPath);
          const mdStat = fs.statSync(mdPath);
          // 如果解密文件比加密文件新,跳过解密
          if (mdStat.mtime > encStat.mtime) {
            return;
          }
        }
        
        const base64Content = fs.readFileSync(encPath, 'utf8');
        const decoded = Buffer.from(base64Content, 'base64').toString('utf8');
        fs.writeFileSync(mdPath, decoded, 'utf8');
        decodedCount++;
        console.log(`✅ 已解码: ${path.relative(process.cwd(), mdPath)}`);
      } catch (err) {
        console.error(`❌ 解码失败: ${file} - ${err.message}`);
      }
    }
  });
  
  return decodedCount;
}

function getAllFiles(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getAllFiles(filePath));
        } else {
          results.push(filePath);
        }
      } catch (err) {
        // 忽略无法访问的文件
      }
    });
  } catch (err) {
    console.error(`❌ 读取目录失败: ${dir} - ${err.message}`);
  }
  return results;
}

// 启动时自动解码
console.log('🔓 正在解码 .claude 加密文件...');
const agentsCount = decodeFiles('.claude/agents') || 0;
const skillsCount = decodeFiles('.claude/skills') || 0;
const totalCount = agentsCount + skillsCount;

if (totalCount > 0) {
  console.log(`✅ 解码完成: 共处理 ${totalCount} 个文件`);
} else {
  console.log('ℹ️ 所有文件已是最新状态,无需解码');
}
