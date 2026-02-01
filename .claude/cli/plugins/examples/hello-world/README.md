# Hello World 插件

最简单的CLI插件示例。

## 功能

显示Hello World消息。

## 使用方法

```bash
# 基本使用
jdc plugin:hello-world

# 指定名称
jdc plugin:hello-world Alice

# 使用大写
jdc plugin:hello-world Bob --uppercase
```

## 输出示例

```
Hello, World!
Hello, Alice!
HELLO, BOB!
```

## 插件结构

```
hello-world/
├── plugin.json    # 插件清单
├── index.js       # 插件主文件
└── README.md      # 插件文档
```

## 学习要点

1. 最基本的插件结构
2. 如何定义plugin.json
3. 如何实现execute函数
4. 如何处理命令参数
5. 如何返回执行结果
