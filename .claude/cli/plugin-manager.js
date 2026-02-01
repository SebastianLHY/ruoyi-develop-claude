#!/usr/bin/env node

/**
 * 插件管理器
 * 负责加载、管理和执行插件
 * 支持：命令插件、步骤插件、智能体插件
 */

const fs = require('fs');
const path = require('path');

// 插件类型
const PluginType = {
  COMMAND: 'command',      // 命令插件
  STEP: 'step',            // 步骤插件
  AGENT: 'agent',          // 智能体插件
  HOOK: 'hook',            // 钩子插件
  CUSTOM: 'custom'         // 自定义插件
};

// 插件状态
const PluginStatus = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  ERROR: 'error'
};

class PluginManager {
  constructor(pluginDir, config = {}) {
    this.pluginDir = pluginDir;
    this.config = config;
    this.plugins = new Map();
    this.hooks = new Map();
    
    // 初始化钩子类型
    this.initHooks();
  }
  
  /**
   * 初始化钩子类型
   */
  initHooks() {
    const hookTypes = [
      'before-command',
      'after-command',
      'before-step',
      'after-step',
      'before-agent',
      'after-agent',
      'on-error',
      'on-success'
    ];
    
    hookTypes.forEach(type => {
      this.hooks.set(type, []);
    });
  }
  
  /**
   * 加载所有插件
   */
  loadPlugins() {
    if (!fs.existsSync(this.pluginDir)) {
      fs.mkdirSync(this.pluginDir, { recursive: true });
      return;
    }
    
    const pluginDirs = fs.readdirSync(this.pluginDir)
      .filter(dir => {
        const fullPath = path.join(this.pluginDir, dir);
        return fs.statSync(fullPath).isDirectory();
      });
    
    pluginDirs.forEach(dir => {
      try {
        this.loadPlugin(dir);
      } catch (error) {
        console.error(`加载插件失败: ${dir}`, error.message);
      }
    });
    
    return this.plugins;
  }
  
  /**
   * 加载单个插件
   */
  loadPlugin(pluginName) {
    const pluginPath = path.join(this.pluginDir, pluginName);
    const manifestPath = path.join(pluginPath, 'plugin.json');
    
    // 检查manifest文件
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`插件缺少 plugin.json: ${pluginName}`);
    }
    
    // 读取manifest
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    
    // 验证manifest
    this.validateManifest(manifest);
    
    // 加载插件主文件
    const mainFile = path.join(pluginPath, manifest.main || 'index.js');
    if (!fs.existsSync(mainFile)) {
      throw new Error(`插件主文件不存在: ${mainFile}`);
    }
    
    // 创建插件实例
    const plugin = {
      name: manifest.name,
      version: manifest.version,
      type: manifest.type,
      description: manifest.description,
      author: manifest.author,
      enabled: manifest.enabled !== false,
      status: PluginStatus.ENABLED,
      path: pluginPath,
      manifest: manifest,
      module: null
    };
    
    // 加载插件模块
    try {
      plugin.module = require(mainFile);
      
      // 初始化插件
      if (typeof plugin.module.init === 'function') {
        plugin.module.init(this.config);
      }
      
      // 注册钩子
      if (plugin.type === PluginType.HOOK && plugin.module.hooks) {
        this.registerHooks(plugin.name, plugin.module.hooks);
      }
      
    } catch (error) {
      plugin.status = PluginStatus.ERROR;
      plugin.error = error.message;
      throw error;
    }
    
    // 存储插件
    this.plugins.set(plugin.name, plugin);
    
    return plugin;
  }
  
  /**
   * 验证插件manifest
   */
  validateManifest(manifest) {
    const required = ['name', 'version', 'type', 'description'];
    
    for (const field of required) {
      if (!manifest[field]) {
        throw new Error(`插件manifest缺少必需字段: ${field}`);
      }
    }
    
    if (!Object.values(PluginType).includes(manifest.type)) {
      throw new Error(`不支持的插件类型: ${manifest.type}`);
    }
  }
  
  /**
   * 注册钩子
   */
  registerHooks(pluginName, hooks) {
    Object.entries(hooks).forEach(([hookType, handler]) => {
      if (this.hooks.has(hookType)) {
        this.hooks.get(hookType).push({
          plugin: pluginName,
          handler: handler
        });
      }
    });
  }
  
  /**
   * 执行钩子
   */
  async executeHook(hookType, context = {}) {
    const hooks = this.hooks.get(hookType) || [];
    
    for (const hook of hooks) {
      try {
        await hook.handler(context);
      } catch (error) {
        console.error(`钩子执行失败 [${hook.plugin}:${hookType}]:`, error.message);
      }
    }
  }
  
  /**
   * 获取插件
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }
  
  /**
   * 获取所有插件
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }
  
  /**
   * 获取指定类型的插件
   */
  getPluginsByType(type) {
    return this.getAllPlugins().filter(p => p.type === type);
  }
  
  /**
   * 启用插件
   */
  enablePlugin(name) {
    const plugin = this.getPlugin(name);
    if (!plugin) {
      throw new Error(`插件不存在: ${name}`);
    }
    
    plugin.enabled = true;
    plugin.status = PluginStatus.ENABLED;
    
    // 调用插件的enable方法
    if (plugin.module && typeof plugin.module.enable === 'function') {
      plugin.module.enable();
    }
    
    return plugin;
  }
  
  /**
   * 禁用插件
   */
  disablePlugin(name) {
    const plugin = this.getPlugin(name);
    if (!plugin) {
      throw new Error(`插件不存在: ${name}`);
    }
    
    plugin.enabled = false;
    plugin.status = PluginStatus.DISABLED;
    
    // 调用插件的disable方法
    if (plugin.module && typeof plugin.module.disable === 'function') {
      plugin.module.disable();
    }
    
    return plugin;
  }
  
  /**
   * 卸载插件
   */
  unloadPlugin(name) {
    const plugin = this.getPlugin(name);
    if (!plugin) {
      throw new Error(`插件不存在: ${name}`);
    }
    
    // 调用插件的cleanup方法
    if (plugin.module && typeof plugin.module.cleanup === 'function') {
      plugin.module.cleanup();
    }
    
    // 从缓存中删除
    delete require.cache[require.resolve(path.join(plugin.path, plugin.manifest.main || 'index.js'))];
    
    // 从插件列表中删除
    this.plugins.delete(name);
    
    return true;
  }
  
  /**
   * 重载插件
   */
  reloadPlugin(name) {
    this.unloadPlugin(name);
    return this.loadPlugin(name);
  }
  
  /**
   * 执行命令插件
   */
  async executeCommandPlugin(pluginName, args = []) {
    const plugin = this.getPlugin(pluginName);
    
    if (!plugin) {
      throw new Error(`插件不存在: ${pluginName}`);
    }
    
    if (!plugin.enabled) {
      throw new Error(`插件已禁用: ${pluginName}`);
    }
    
    if (plugin.type !== PluginType.COMMAND) {
      throw new Error(`插件类型不是命令插件: ${pluginName}`);
    }
    
    if (!plugin.module || typeof plugin.module.execute !== 'function') {
      throw new Error(`插件缺少execute方法: ${pluginName}`);
    }
    
    // 执行before-command钩子
    await this.executeHook('before-command', { plugin: pluginName, args });
    
    try {
      const result = await plugin.module.execute(args);
      
      // 执行after-command钩子
      await this.executeHook('after-command', { plugin: pluginName, args, result });
      
      // 执行on-success钩子
      await this.executeHook('on-success', { plugin: pluginName, args, result });
      
      return result;
    } catch (error) {
      // 执行on-error钩子
      await this.executeHook('on-error', { plugin: pluginName, args, error });
      
      throw error;
    }
  }
  
  /**
   * 执行步骤插件
   */
  async executeStepPlugin(pluginName, context = {}) {
    const plugin = this.getPlugin(pluginName);
    
    if (!plugin) {
      throw new Error(`插件不存在: ${pluginName}`);
    }
    
    if (!plugin.enabled) {
      throw new Error(`插件已禁用: ${pluginName}`);
    }
    
    if (plugin.type !== PluginType.STEP) {
      throw new Error(`插件类型不是步骤插件: ${pluginName}`);
    }
    
    if (!plugin.module || typeof plugin.module.execute !== 'function') {
      throw new Error(`插件缺少execute方法: ${pluginName}`);
    }
    
    // 执行before-step钩子
    await this.executeHook('before-step', { plugin: pluginName, context });
    
    try {
      const result = await plugin.module.execute(context);
      
      // 执行after-step钩子
      await this.executeHook('after-step', { plugin: pluginName, context, result });
      
      return result;
    } catch (error) {
      // 执行on-error钩子
      await this.executeHook('on-error', { plugin: pluginName, context, error });
      
      throw error;
    }
  }
  
  /**
   * 执行智能体插件
   */
  async executeAgentPlugin(pluginName, task = '') {
    const plugin = this.getPlugin(pluginName);
    
    if (!plugin) {
      throw new Error(`插件不存在: ${pluginName}`);
    }
    
    if (!plugin.enabled) {
      throw new Error(`插件已禁用: ${pluginName}`);
    }
    
    if (plugin.type !== PluginType.AGENT) {
      throw new Error(`插件类型不是智能体插件: ${pluginName}`);
    }
    
    if (!plugin.module || typeof plugin.module.execute !== 'function') {
      throw new Error(`插件缺少execute方法: ${pluginName}`);
    }
    
    // 执行before-agent钩子
    await this.executeHook('before-agent', { plugin: pluginName, task });
    
    try {
      const result = await plugin.module.execute(task);
      
      // 执行after-agent钩子
      await this.executeHook('after-agent', { plugin: pluginName, task, result });
      
      return result;
    } catch (error) {
      // 执行on-error钩子
      await this.executeHook('on-error', { plugin: pluginName, task, error });
      
      throw error;
    }
  }
  
  /**
   * 列出所有插件
   */
  listPlugins() {
    return this.getAllPlugins().map(p => ({
      name: p.name,
      version: p.version,
      type: p.type,
      description: p.description,
      author: p.author,
      enabled: p.enabled,
      status: p.status
    }));
  }
  
  /**
   * 获取插件信息
   */
  getPluginInfo(name) {
    const plugin = this.getPlugin(name);
    if (!plugin) {
      return null;
    }
    
    return {
      name: plugin.name,
      version: plugin.version,
      type: plugin.type,
      description: plugin.description,
      author: plugin.author,
      enabled: plugin.enabled,
      status: plugin.status,
      path: plugin.path,
      manifest: plugin.manifest
    };
  }
  
  /**
   * 搜索插件
   */
  searchPlugins(query) {
    const lowerQuery = query.toLowerCase();
    
    return this.getAllPlugins().filter(p => {
      return p.name.toLowerCase().includes(lowerQuery) ||
             p.description.toLowerCase().includes(lowerQuery) ||
             (p.author && p.author.toLowerCase().includes(lowerQuery));
    });
  }
}

// 导出
module.exports = {
  PluginManager,
  PluginType,
  PluginStatus
};
