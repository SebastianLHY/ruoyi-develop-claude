	/**
	 *  PreToolUse Hook - 工具使用前触发
	 * 功能：
	 * 1、 阻止危险命令
	 * 2、 提醒敏感操作
	 * 3、 自动修正常见错误
	 */
	const fs = require('fs');
	const path = require('path');
	const { execSync } = require('child_process');
	// 从stdin 读取输入
	let inputData = '';
	try {
	    inputData = fs.readFileSync(0, 'utf8');
	} catch {
	    process.exit(0);
	}
	let input;
	try {
	    input = JSON.parse(inputData);
	} catch {
	    process.exit(0);
	}

	// 0. 提取命令字符串 (必须放在危险检测之前)
	// 尝试从 Claude Tool 不同的数据结构中提取 command
	let command = '';
	if (input.input && typeof input.input.command === 'string') {
	    command = input.input.command;
	} else if (input.args && typeof input.args.command === 'string') {
	    command = input.args.command;
	} else if (typeof input.command === 'string') {
	    command = input.command;
	}
	// 如果没有提取到命令，直接透传输入，不做任何处理
	if (!command) {
	    console.log(JSON.stringify(input));
	    process.exit(0);
	}
// 1. 阻止危险命令 (整合您提供的核心逻辑)
const dangerousPatterns = [
    /rm\s+(-rf?|--recursive).*\//,   // rm -rf /
    /drop\s+(database|table)/i,      // SQL删库
    /format\s+[a-z]:/i,              // 格式化磁盘
    />\s*\/dev\/sda/,                 // 写入磁盘设备
    /dd\s+.*\s+of=\/dev\//,          // dd 破坏性写入
    /git\s+push\s+(--force|-f)\s+(origin\s+)?(main|master)/i, // 强推主分支
    /git\s+reset\s+--hard\s+HEAD~\d+/, // 硬重置多个提交
    /git\s+clean\s+-fdx/,             // 清理所有未跟踪文件
];
	if (dangerousPatterns.some(p => p.test(command))) {
	    console.log(JSON.stringify({
	        decision: "block",
	        reason: "检测到危险命令，已阻止执行"
	    }));
	    process.exit(0);
	}
	// 2. 阻止运行未经授权的脚本 (防止下载后直接运行不明脚本)
	// 检测是否尝试运行临时目录、下载目录或当前目录下的脚本
	const unauthorizedScriptPatterns = [
	    /\.\//,                          // 执行当前目录脚本
	    /~\/Downloads\//,                // 下载目录脚本
	    /\/tmp\//,                       // 临时目录脚本
	];
	// 如果命令涉及解释器 且包含敏感路径
	if (/^((bash|sh|zsh|node|python|perl|ruby)\s+)/.test(command) && 
	    unauthorizedScriptPatterns.some(p => p.test(command))) {
	    console.log(JSON.stringify({
	        decision: "block",
	        reason: "阻止运行未经授权的脚本 (禁止执行当前目录、/tmp或Downloads下的脚本)"
	    }));
	    process.exit(0);
	}
	// 3. 提醒敏感操作 (不阻断，仅警告)
	const sensitivePatterns = [
	    /rm\s+/,                         // 删除文件
	    /mv\s+/,                         // 移动文件
	    /chmod\s+(777|000)/,             // 危险权限修改
	    /\/etc\//,                       // 修改系统配置
	    /systemctl\s+(stop|restart|disable)/i, // 服务控制
	    /npm\s+(install|i)\s+.*--global/i, // 全局安装npm包
	    /\.env|application\.yml|application\.properties/i, // 修改敏感配置文件
	];
	if (sensitivePatterns.some(p => p.test(command))) {
	    console.error(`[警告] 检测到敏感操作: ${command}`);
	}
	// 4. 自动修正常见错误
	let modifiedInput = input;
	let hasFixes = false;
	// 修复 A: python -> python3 (兼容系统环境)
	if (/^python\s/.test(command) && !/^python3\s/.test(command)) {
	    console.error('[自动修复] 将 python 替换为 python3');
	    if (input.input && input.input.command) {
	        modifiedInput.input.command = command.replace(/^python\s/, 'python3 ');
	    } else if (input.args && input.args.command) {
	        modifiedInput.args.command = command.replace(/^python\s/, 'python3 ');
	    } else if (input.command) {
	        modifiedInput.command = command.replace(/^python\s/, 'python3 ');
	    }
	    hasFixes = true;
	}
	// 修复 B: 在 git commit 时如果未加 -m，自动添加 (防止进入交互式界面卡住)
	// 注意：这需要根据实际场景开启，此处仅作示例
	// if (/^git\s+commit$/.test(command.trim())) {
	//     console.error('[自动修复] git commit 缺少 -m 参数，自动添加 --allow-empty');
	//     // ... 修改 command 逻辑
	// }
	// 最终输出
	// 必须将 input (可能是修改后的 modifiedInput) 打印回 stdout，否则 Claude 会认为工具调用失败
	console.log(JSON.stringify(modifiedInput));