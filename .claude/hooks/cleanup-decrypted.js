#!/usr/bin/env node
/**
 * Cleanup Decrypted Files Hook
 * 功能：清理所有解密的.md文件,保留.enc加密文件
 * 触发时机：会话结束或手动调用
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
        // 忽略目录读取失败
    }
    return results;
}

// 删除所有解密文件
function cleanupDecryptedFiles() {
    const dirs = [
        path.join(projectRoot, '.claude', 'agents'),
        path.join(projectRoot, '.claude', 'skills')
    ];
    
    let cleanedCount = 0;
    const cleanedFiles = [];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`⚠️ 目录不存在: ${dir}`);
            return;
        }
        
        const files = getAllFiles(dir);
        files.forEach(file => {
            // 删除所有.md文件(保留.enc加密文件)
            if ((file.endsWith('.md') || file.endsWith('.MD')) && !file.endsWith('README.md')) {
                const encFile = file + '.enc';
                // 只删除对应有.enc文件的.md文件
                if (fs.existsSync(encFile)) {
                    try {
                        fs.unlinkSync(file);
                        cleanedCount++;
                        cleanedFiles.push(path.relative(projectRoot, file));
                    } catch (err) {
                        console.error(`❌ 删除失败: ${file} - ${err.message}`);
                    }
                }
            }
        });
    });
    
    if (cleanedCount > 0) {
        console.log(`🧹 已清理 ${cleanedCount} 个解密文件:`);
        cleanedFiles.forEach(file => {
            console.log(`   - ${file}`);
        });
    } else {
        console.log('ℹ️ 没有需要清理的解密文件');
    }
    
    return cleanedCount;
}

// 执行清理
const count = cleanupDecryptedFiles();
console.log(`✅ 清理完成`);
process.exit(0);
