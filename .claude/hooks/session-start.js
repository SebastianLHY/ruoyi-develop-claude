#!/usr/bin/env node
	/**
	 *  SessionStart Hook - 会话启动时字段加载项目状态
	 *  功能：检查并加载项目进度、Git状态、待办事项
	 */
	const fs = require('fs');
	const path = require('path');
	const { execSync } = require('child_process');
	const projectRoot = process.cwd();
	// 辅助函数：安全执行命令
	function safeExec(cmd) {
	    try {
	        // 添加 shell: true 以支持通配符和管道
	        return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], shell: true, cwd: projectRoot }).trim();
	    } catch (error) {
	        // 某些命令（如 grep 没找到结果）会返回非 0 状态码，但 stdout 可能为空
	        // 如果有输出则返回输出，否则返回 null
	        if (error.stdout) return error.stdout.trim();
	        return null;
	    }
	}
	// 辅助函数：读取文件
	function readFile(filePath) {
	    try {
	        const fullPath = path.join(projectRoot, filePath);
	        if (fs.existsSync(fullPath)) {
	            return fs.readFileSync(fullPath, 'utf-8');
	        }
	    } catch (err) {
	        // 忽略读取错误
	    }
	    return null;
	}
	// 获取项目名称（优先从 package.json 或 pom.xml 获取）
	function getProjectName() {
	    // 尝试读取 package.json
	    const pkgJson = readFile('package.json');
	    if (pkgJson) {
	        try {
	            const name = JSON.parse(pkgJson).name;
	            if (name) return name;
	        } catch (e) {}
	    }
	    // 尝试读取 pom.xml (Java/Maven 项目，如 RuoYi)
	    const pomXml = readFile('pom.xml');
	    if (pomXml) {
	        const nameMatch = pomXml.match(/<name>([\s\S]*?)<\/name>/);
	        if (nameMatch && nameMatch[1]) {
	            return nameMatch[1].trim();
	        }
	    }
	    // 默认返回当前文件夹名称
	    return path.basename(projectRoot);
	}
	// 获取 Git 信息
	function getGitInfo() {
	    const branch = safeExec('git rev-parse --abbrev-ref HEAD') || 'main/master';
	    // 获取变更文件列表 (git status --short: M modified, ?? untracked, etc.)
	    const statusOutput = safeExec('git status --short');
	    const changes = [];
	    if (statusOutput) {
	        const lines = statusOutput.split('\n');
	        lines.forEach(line => {
	            const parts = line.trim().split(/\s+/);
	            if (parts.length >= 2) {
	                const statusCode = parts[0];
	                const filePath = parts.slice(1).join(' ');
	                // 只处理已修改 (M), 已暂存 (M/A), 删除 (D) 等有意义的变更
	                if (['M', 'A', 'D', 'R', 'MM', 'AM'].includes(statusCode.substring(0, 1)) || 
	                    ['M', 'A', 'D', 'R'].includes(statusCode.substring(1))) {
	                    changes.push({
	                        status: statusCode,
	                        path: filePath
	                    });
	                }
	            }
	        });
	    }
	    return { branch, changes };
	}
	// 获取待办事项统计
	function getTodoStats() {
	    // 定义要搜索的文件扩展名
	    const extensions = "*.vue *.js *.ts *.jsx *.tsx *.java *.html *.css *.scss *.json";
	    // 搜索未完成的 TODO 和 FIXME
	    // 排除 node_modules, .git, target, dist 等目录
	    const incompleteCmd = `grep -rnE "TODO|FIXME" --include={${extensions}} --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=target --exclude-dir=dist --exclude-dir=build . 2>/dev/null | wc -l`;
	    const incompleteCount = parseInt(safeExec(incompleteCmd) || '0', 10);
	    // 搜索已完成的 DONE (假设项目使用 DONE 标记完成，或者根据实际情况调整正则)
	    // 如果项目没有标记 "DONE"，这里可能统计为 0，或者可以根据日志统计
	    const completedCmd = `grep -rnE "DONE|FIXED|@completed" --include={${extensions}} --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=target --exclude-dir=dist --exclude-dir=build . 2>/dev/null | wc -l`;
	    const completedCount = parseInt(safeExec(completedCmd) || '0', 10);
	    return { incomplete: incompleteCount, completed: completedCount };
	}
	// 检查会话健康度（判断是否需要重置对话）
	function checkSessionHealth() {
	    const counterFile = path.join(projectRoot, '.claude', '.session-counter');
	    const result = {
	        count: 1,
	        shouldReset: false,
	        reasons: []
	    };
	    
	    // 检测1: 文件计数器
	    if (fs.existsSync(counterFile)) {
	        try {
	            const data = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
	            result.count = (data.count || 0) + 1;
	            const startTime = data.startTime || new Date().toISOString();
	            const elapsed = Date.now() - new Date(startTime).getTime();
	            
	            // 超过15轮对话
	            if (result.count > 15) {
	                result.shouldReset = true;
	                result.reasons.push(`对话轮数过多 (${result.count}轮)`);
	            }
	            // 超过1小时
	            if (elapsed > 3600000) {
	                result.shouldReset = true;
	                result.reasons.push(`会话时间过长 (${Math.floor(elapsed/60000)}分钟)`);
	            }
	        } catch (e) {
	            // 读取失败时重置
	        }
	    }
	    
	    // 检测2: Git未提交变更数量
	    const changesCount = safeExec('git diff --name-only | wc -l');
	    if (changesCount) {
	        const count = parseInt(changesCount.trim());
	        if (count > 30) {
	            result.shouldReset = true;
	            result.reasons.push(`大量未提交变更 (${count}个文件)`);
	        }
	    }
	    
	    // 更新计数器文件
	    try {
	        let startTime = new Date().toISOString();
	        if (fs.existsSync(counterFile)) {
	            const oldData = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
	            startTime = oldData.startTime || startTime;
	        }
	        
	        // 如果需要重置，则重新开始计数
	        if (result.shouldReset) {
	            fs.writeFileSync(counterFile, JSON.stringify({
	                count: result.count, // 保留当前计数用于显示
	                startTime: startTime,
	                lastUpdate: new Date().toISOString(),
	                needReset: true
	            }, null, 2));
	        } else {
	            fs.writeFileSync(counterFile, JSON.stringify({
	                count: result.count,
	                startTime: startTime,
	                lastUpdate: new Date().toISOString()
	            }, null, 2));
	        }
	    } catch (e) {
	        // 写入失败静默忽略
	    }
	    
	    return result;
	}
	// 主执行函数
	function main() {
	    const projectName = getProjectName();
	    const now = new Date();
	    const timeString = now.toLocaleString('zh-CN', { hour12: false }); // 格式: 2024/12/23 14:14:36
	    const gitInfo = getGitInfo();
	    const todoStats = getTodoStats();
	    const sessionHealth = checkSessionHealth();
	    
	    // 开始构建输出
	    let output = '';
	    // 1. 标题
	    output += `## 🚀 ${projectName} 会话已启动\n\n`;
	    // 2. 时间
	    output += `**时间**: ${timeString}\n`;
	    // 3. Git 分支
	    output += `**Git 分支**: \`${gitInfo.branch}\`\n`;
	    // 4. 会话状态
	    output += `**会话状态**: 第 ${sessionHealth.count} 轮对话\n\n`;
	    
	    // 5. 会话健康度检查
	    if (sessionHealth.shouldReset) {
	        output += `⚠️ **建议重置对话** (降低Token消耗):\n`;
	        sessionHealth.reasons.forEach(reason => {
	            output += `  • ${reason}\n`;
	        });
	        output += `\n💡 **操作建议**:\n`;
	        output += `  1. 提交当前变更: \`git add . && git commit -m "阶段性提交"\`\n`;
	        output += `  2. 关闭当前对话窗口，重新开始新会话\n`;
	        output += `  3. 或手动重置: \`rm .claude/.session-counter\`\n\n`;
	    }
	    
	    // 6. 未提交变更
	    if (gitInfo.changes.length > 0) {
	        output += `⚠️ **未提交变更** (${gitInfo.changes.length} 个文件):\n`;
	        gitInfo.changes.forEach(change => {
	            let icon = 'M'; // 默认 Modified
	            if (change.status.includes('A') || change.status.includes('?')) icon = 'A'; // Added
	            if (change.status.includes('D')) icon = 'D'; // Deleted
	            if (change.status.includes('R')) icon = 'R'; // Renamed
	            // 简单的路径截断，避免太长
	            let displayPath = change.path;
	            if (displayPath.length > 50) {
	                displayPath = '...' + displayPath.slice(-47);
	            }
	            output += `  ${icon} ${displayPath}\n`;
	        });
	        output += '\n';
	    }
	    // 7. 待办事项
	    output += `📋 **待办事项**: ${todoStats.incomplete} 未完成 / ${todoStats.completed} 已完成\n\n`;
	    // 8. 快捷命令菜单 (根据项目特点展示)
	    output += `💡 **快捷命令**:\n`;
	    output += `| /dev  | 开发新功能 |\n`;
	    output += `| /crud | 快速生成CRUD |\n`;
	    output += `| /check| 代码规范检查 |\n`;
	    console.log(output);
	}
	main();