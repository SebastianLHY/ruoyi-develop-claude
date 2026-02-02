#!/usr/bin/env node
/**
 * Encode Files - 批量加密文件
 * 功能：将所有.md文件(除README外)加密为.enc文件
 * 用途：新增或更新技能/代理文件后统一加密
 */

const fs = require('fs');
const path = require('path');
const projectRoot = process.cwd();

// 递归获取所有文件
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

// 加密文件
function encodeFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`⚠️ 目录不存在: ${dir}`);
        return 0;
    }
    
    const files = getAllFiles(dir);
    let encodedCount = 0;
    const encodedFiles = [];
    
    files.forEach(file => {
        // 只加密 .md 文件,但排除 README.md
        if ((file.endsWith('.md') || file.endsWith('.MD')) && 
            !file.endsWith('README.md') && 
            !file.endsWith('readme.md')) {
            
            try {
                const mdPath = file;
                const encPath = file + '.enc';
                
                // 检查是否需要更新加密文件
                let needUpdate = true;
                if (fs.existsSync(encPath)) {
                    const mdStat = fs.statSync(mdPath);
                    const encStat = fs.statSync(encPath);
                    // 如果加密文件比原文件新,跳过加密
                    if (encStat.mtime > mdStat.mtime) {
                        needUpdate = false;
                    }
                }
                
                if (needUpdate) {
                    // 读取原文件内容
                    const content = fs.readFileSync(mdPath, 'utf8');
                    // Base64编码
                    const encoded = Buffer.from(content, 'utf8').toString('base64');
                    // 写入加密文件
                    fs.writeFileSync(encPath, encoded, 'utf8');
                    
                    encodedCount++;
                    encodedFiles.push({
                        original: path.relative(projectRoot, mdPath),
                        encrypted: path.relative(projectRoot, encPath)
                    });
                    
                    console.log(`✅ 已加密: ${path.relative(projectRoot, mdPath)}`);
                }
            } catch (err) {
                console.error(`❌ 加密失败: ${file} - ${err.message}`);
            }
        }
    });
    
    return { count: encodedCount, files: encodedFiles };
}

// 主执行函数
function main() {
    console.log('🔐 正在加密 .claude 文件...\n');
    
    const agentsResult = encodeFiles(path.join(projectRoot, '.claude', 'agents'));
    const skillsResult = encodeFiles(path.join(projectRoot, '.claude', 'skills'));
    
    const totalCount = agentsResult.count + skillsResult.count;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (totalCount > 0) {
        console.log(`✅ 加密完成: 共处理 ${totalCount} 个文件\n`);
        
        console.log('📋 已加密文件列表:');
        [...agentsResult.files, ...skillsResult.files].forEach(item => {
            console.log(`   ${item.original} → ${item.encrypted}`);
        });
        
        console.log('\n⚠️ 重要提示:');
        console.log('   1. 原始 .md 文件仍然存在,需要手动删除');
        console.log('   2. 使用以下命令删除原始文件:\n');
        
        console.log('   # Windows PowerShell:');
        console.log('   Remove-Item .claude/agents/**/*.md -Exclude README.md');
        console.log('   Remove-Item .claude/skills/**/*.md -Exclude README.md\n');
        
        console.log('   # Linux/macOS:');
        console.log('   find .claude/agents -name "*.md" ! -name "README.md" -delete');
        console.log('   find .claude/skills -name "*.md" ! -name "README.md" -delete\n');
        
        console.log('   3. 提交加密文件到 Git:');
        console.log('   git add .claude/**/*.enc');
        console.log('   git commit -m "update: 更新加密文件"');
        
    } else {
        console.log('ℹ️ 所有文件已是最新加密状态,无需处理');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
