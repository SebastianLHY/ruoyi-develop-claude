#!/usr/bin/env node
/**
 *  Stop Hook - Claude 回答结束时触发
 * 功能：
 * 1、 检查代码变更
 * 2、 提醒更新项目文档
 * 3、 建议下一步操作
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 从stdin 读取输入
let inputData = '';
try {
    inputData = fs.readFileSync(0,'utf8');
} catch {
    process.exit(0);
}

let input;
try {
    input = JSON.parse(inputData);
} catch {
    process.exit(0);
}

// 辅助函数：安全执行命令
function safeExec(cmd){
    try {
        return execSync(cmd,{ encoding:'utf8',stdio:['pipe','pipe','pipe'] }).trim();
    } catch {
        return null;
    }
}

//检查是否有代码变更
const changedFiles = safeExec('git diff --name-only');
const stagedFiles = safeExec('git diff --cached --name-only');
const untrackedFiles = safeExec('git ls-files --others --exclude-standard');

const allChanges = [
    ...(changedFiles ? changedFiles.split('\n'):[]),
    ...(stagedFiles ? stagedFiles.split('\n'):[]),
    ...(untrackedFiles ? untrackedFiles.split('\n'):[])
].filter(f => f);

//清理可能误创建的 null 文件（Windows 下 > null 可能创建该文件）
//递归查询并删除项目下所有null文件
const findAndDeleteNull = (dir, depth = 0) => {
    if(depth > 5) return; //限制递归深度
    try {
        const entries = fs.readdirSync(dir,{ withFileTypes:true });
        for(const entry of entries){
            const fullPath = path.join(dir,entry.name);
            if(entry.isFile() && entry.name === 'null'){
                fs.unlinkSync(fullPath);
                console.error(`已清理：${fullPath}`);
            } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules'){
                findAndDeleteNull(fullPath,depth + 1);
            }
        }
    } catch {
        // 访问失败时都忽略
    }
};
findAndDeleteNull(process.cwd());

// 播放完成音效（无论是否有变更都播放）
const audioFile = path.join(process.cwd(), '.claude', 'audio', 'completed.wav');
try {
	if (fs.existsSync(audioFile)) {
	    const platform = process.platform;
	    if (platform === 'darwin') {
	        // macOS
	        execSync(`afplay "${audioFile}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
	     } else if (platform === 'win32') {
	        // Windows
	        execSync(`powershell -c "(New-Object System.Media.SoundPlayer) '${audioFile.replace(/'/g, "''")}'.PlaySync()"`, {
	            stdio: ['pipe', 'pipe', 'pipe']
	        });
	    } else if (platform === 'linux') {
	        // Linux（尝试多种播放器）
	        try {
	            execSync(`aplay "${audioFile}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
	        } catch {
	            try {
	                execSync(`paplay "${audioFile}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
	            } catch {
	                // 播放失败，静默忽略
	            }
	        }
	    }
	}
} catch {
	// 播放失败，静默忽略
}

if(allChanges.length === 0){
    //无变更，退出
    process.exit(0);
}

const javaFiles = allChanges.filter(f => f.endsWith('.java'));
const vueFiles = allChanges.filter(f => f.endsWith('.vue'));
const tsFiles = allChanges.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
const sqlFiles = allChanges.filter(f => f.endsWith('.sql'));

let suggestions = [];

//后端代码变更
if (javaFiles.length > 0){
    suggestions.push('- 使用 `@code-reviewer` 审查后端代码');

    // 检查是否有新增的业务模块
    const newServices = javaFiles.filter(f => f.includes('ServiceImpl') && !f.includes('test'));
    if(newServices.length > 0){
        suggestions.push('- 新增了 Service，记得更新项目文档');
    }
    
    // 检查Controller接口变更
    const controllerFiles = javaFiles.filter(f => f.includes('Controller'));
    if(controllerFiles.length > 0){
        suggestions.push('- Controller接口变更，检查 @SaCheckPermission 权限标识');
    }
    
    // 检查Mapper变更
    const mapperFiles = javaFiles.filter(f => f.includes('Mapper'));
    if(mapperFiles.length > 0){
        suggestions.push('- Mapper SQL变更，确保防止SQL注入');
    }
}

//前端代码变更
if(vueFiles.length > 0 || tsFiles.length > 0){
    const pcFiles = [...vueFiles,...tsFiles].filter(f => f.includes('plus-ui'));
    const mobileFiles = [...vueFiles,...tsFiles].filter(f => f.includes('plus-uniapp'));

    if(pcFiles.length > 0){
        suggestions.push('- PC 端代码有变更，确保使用 A* 组件');
    }
    if(mobileFiles.length > 0){
        suggestions.push('- 移动端代码有变更，确保使用 wd-* 组件');
    }
}

//SQL 变更
if (sqlFiles.length > 0){
    suggestions.push('- SQL 文件变更，确保更新所有数据库脚本（MYSQL/Oracle/PostgreSQL/SQLServer）');
}

// 检查敏感配置文件变更
const configFiles = allChanges.filter(f => 
    f.includes('.env') || 
    f.includes('application.yml') || 
    f.includes('application.properties') ||
    f.includes('application-dev') ||
    f.includes('application-prod')
);
if (configFiles.length > 0){
    suggestions.push('- ⚠️ 敏感配置文件变更，确保不提交密钥/密码等信息');
}

// 输出提醒
if (suggestions.length > 0){
    const output = {
        systemMessage: `\n---\n **任务完成** | 检测到 ${allChanges.length}个文件变更\n\n**建议操作**:\n${suggestions.join('\n')}`
    };
    console.log(JSON.stringify(output));
}

// 清理解密文件
const cleanupScript = path.join(process.cwd(), '.claude', 'hooks', 'cleanup-decrypted.js');
if (fs.existsSync(cleanupScript)) {
    try {
        // 静默执行清理脚本
        execSync(`node "${cleanupScript}"`, { 
            encoding: 'utf8', 
            stdio: 'ignore',
            cwd: process.cwd() 
        });
    } catch (err) {
        // 清理失败不影响主流程
    }
}

process.exit(0);