/**
 * Hello World 示例插件
 * 展示最基本的插件结构
 */

// 插件初始化
function init(config) {
  console.log('[hello-world] 插件初始化');
}

// 执行命令
async function execute(args) {
  const name = args[0] || 'World';
  const uppercase = args.includes('--uppercase');
  
  let message = `Hello, ${name}!`;
  
  if (uppercase) {
    message = message.toUpperCase();
  }
  
  console.log(message);
  
  return {
    success: true,
    message: message
  };
}

// 启用插件
function enable() {
  console.log('[hello-world] 插件已启用');
}

// 禁用插件
function disable() {
  console.log('[hello-world] 插件已禁用');
}

// 清理资源
function cleanup() {
  console.log('[hello-world] 插件清理完成');
}

module.exports = {
  init,
  execute,
  enable,
  disable,
  cleanup
};
