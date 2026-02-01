# CLI工具安装指南

> **版本**: v1.0.0  
> **最后更新**: 2026-01-29

---

## 📋 目录

- [系统要求](#系统要求)
- [安装步骤](#安装步骤)
- [配置说明](#配置说明)
- [验证安装](#验证安装)
- [卸载说明](#卸载说明)
- [故障排除](#故障排除)

---

## 💻 系统要求

### 必需软件

1. **Node.js**
   - 版本: >= 14.0.0
   - 推荐: >= 16.0.0
   - 下载: [nodejs.org](https://nodejs.org/)

2. **Claude CLI**
   - 已安装并配置
   - 可以正常执行 `claude` 命令

### 支持的操作系统

- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 18.04+, CentOS 7+, etc.)

---

## 🚀 安装步骤

### 方法1: 直接使用 (推荐)

CLI工具已包含在项目中，无需额外安装。

```bash
# 进入CLI目录
cd d:\git_repository\java-development-claude\.claude\cli

# 测试CLI工具
node cli.js --help
```

### 方法2: 全局安装 (可选)

如果希望在任何位置都能使用 `jdc` 命令：

#### Windows系统

**选项A: 添加到PATH环境变量**

1. 右键"此电脑" → "属性" → "高级系统设置"
2. 点击"环境变量"
3. 在"系统变量"中找到"Path"，点击"编辑"
4. 添加CLI目录路径: `d:\git_repository\java-development-claude\.claude\cli`
5. 点击"确定"保存
6. 重启命令行窗口

**选项B: 创建快捷方式**

```batch
# 在用户目录创建快捷批处理文件
echo @echo off > %USERPROFILE%\jdc.bat
echo node "d:\git_repository\java-development-claude\.claude\cli\cli.js" %%* >> %USERPROFILE%\jdc.bat
```

#### Linux/Mac系统

**选项A: 创建符号链接**

```bash
# 添加执行权限
chmod +x d:/git_repository/java-development-claude/.claude/cli/jdc.sh

# 创建符号链接
sudo ln -s d:/git_repository/java-development-claude/.claude/cli/jdc.sh /usr/local/bin/jdc
```

**选项B: 添加到PATH**

编辑 `~/.bashrc` 或 `~/.zshrc`:

```bash
# 添加以下行
export PATH="$PATH:d:/git_repository/java-development-claude/.claude/cli"
alias jdc='node d:/git_repository/java-development-claude/.claude/cli/cli.js'

# 重新加载配置
source ~/.bashrc  # 或 source ~/.zshrc
```

### 方法3: NPM全局安装 (高级)

```bash
# 进入CLI目录
cd d:\git_repository\java-development-claude\.claude\cli

# 全局安装
npm install -g .

# 或使用npm link
npm link
```

---

## ⚙️ 配置说明

### 1. 基础配置

编辑 `cli.js` 中的 `CONFIG` 对象:

```javascript
const CONFIG = {
  commandsDir: path.join(__dirname, '..', 'commands'),
  agentsDir: path.join(__dirname, '..', 'agents'),
  projectRoot: path.join(__dirname, '..', '..'),
  claudeCmd: 'claude',
  skipPermissions: true
};
```

### 2. Claude命令配置

如果Claude CLI不在PATH中，需要指定完整路径:

```javascript
claudeCmd: 'C:\\path\\to\\claude.exe'  // Windows
claudeCmd: '/usr/local/bin/claude'     // Linux/Mac
```

### 3. 权限配置

如果不想跳过权限检查:

```javascript
skipPermissions: false
```

### 4. 环境变量配置 (可选)

创建 `.env` 文件:

```bash
JDC_CLAUDE_CMD=claude
JDC_SKIP_PERMISSIONS=true
JDC_VERBOSE=false
```

---

## ✅ 验证安装

### 1. 检查Node.js

```bash
node --version
# 应显示: v14.0.0 或更高版本
```

### 2. 检查Claude CLI

```bash
claude --version
# 应显示Claude CLI版本信息
```

### 3. 测试CLI工具

```bash
# 进入CLI目录
cd d:\git_repository\java-development-claude\.claude\cli

# 显示帮助信息
node cli.js --help

# 或使用快捷脚本
jdc --help  # Windows
./jdc.sh --help  # Linux/Mac
```

### 4. 运行测试套件

```bash
# 运行测试
node test.js

# 应显示所有测试通过
```

### 5. 测试基本命令

```bash
# 测试dry-run模式
node cli.js start --dry-run

# 测试帮助命令
node cli.js help

# 测试步骤命令
node cli.js step1 --dry-run "测试模块"
```

---

## 🗑️ 卸载说明

### 方法1: 直接使用的卸载

直接删除CLI目录即可:

```bash
# Windows
rmdir /s /q d:\git_repository\java-development-claude\.claude\cli

# Linux/Mac
rm -rf d:/git_repository/java-development-claude/.claude/cli
```

### 方法2: 全局安装的卸载

#### Windows系统

1. 从PATH环境变量中移除CLI目录
2. 删除创建的快捷批处理文件

```batch
del %USERPROFILE%\jdc.bat
```

#### Linux/Mac系统

```bash
# 删除符号链接
sudo rm /usr/local/bin/jdc

# 从.bashrc或.zshrc中移除相关配置
```

### 方法3: NPM全局安装的卸载

```bash
# 卸载全局包
npm uninstall -g java-development-claude-cli

# 或取消链接
npm unlink
```

---

## 🔍 故障排除

### 问题1: Node.js未找到

**错误信息:**
```
'node' 不是内部或外部命令
```

**解决方案:**
1. 确认Node.js已安装: 访问 [nodejs.org](https://nodejs.org/) 下载安装
2. 重启命令行窗口
3. 检查PATH环境变量

### 问题2: Claude命令未找到

**错误信息:**
```
'claude' 不是内部或外部命令
```

**解决方案:**
1. 确认Claude CLI已安装
2. 配置 `CONFIG.claudeCmd` 为Claude的完整路径
3. 或将Claude添加到PATH环境变量

### 问题3: 权限错误 (Linux/Mac)

**错误信息:**
```
Permission denied
```

**解决方案:**
```bash
# 添加执行权限
chmod +x jdc.sh
chmod +x cli.js

# 或使用sudo
sudo ./jdc.sh <command>
```

### 问题4: 模块未找到

**错误信息:**
```
Error: Cannot find module 'xxx'
```

**解决方案:**
```bash
# 安装依赖
npm install

# 或重新安装
npm install --force
```

### 问题5: 命令文件未找到

**错误信息:**
```
命令文件不存在: xxx.md
```

**解决方案:**
1. 检查 `CONFIG.commandsDir` 路径是否正确
2. 确认命令文件存在于 `.claude/commands/` 目录
3. 检查文件名是否正确

### 问题6: 脚本执行失败

**错误信息:**
```
命令执行失败
```

**解决方案:**
1. 使用 `--verbose` 选项查看详细错误信息
2. 使用 `--dry-run` 选项预览命令
3. 检查Claude CLI是否正常工作
4. 查看错误日志

### 问题7: Windows路径问题

**错误信息:**
```
路径格式不正确
```

**解决方案:**
- 使用双反斜杠: `C:\\path\\to\\file`
- 或使用正斜杠: `C:/path/to/file`
- 使用 `path.join()` 构建路径

---

## 📊 安装验证清单

完成安装后，请检查以下项目:

- [ ] Node.js版本 >= 14.0.0
- [ ] Claude CLI可以正常执行
- [ ] CLI工具可以显示帮助信息
- [ ] 测试套件全部通过
- [ ] 可以执行基本命令 (--dry-run模式)
- [ ] 快捷脚本可以正常工作 (如果配置)
- [ ] 环境变量配置正确 (如果使用)

---

## 🎯 下一步

安装完成后，你可以:

1. 阅读 [CLI README](README.md) 了解详细用法
2. 查看 [示例脚本](examples/README.md) 学习最佳实践
3. 运行 `jdc quick-start` 快速上手
4. 创建自己的自动化脚本

---

## 📞 获取帮助

如果遇到问题:

1. 查看 [故障排除](#故障排除) 部分
2. 运行 `node test.js` 诊断问题
3. 使用 `--verbose` 选项获取详细信息
4. 提交 Issue 或联系开发团队

---

## 📝 更新日志

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0.0 | 2026-01-29 | 初始版本发布 |

---

祝你使用愉快！ 🎉
