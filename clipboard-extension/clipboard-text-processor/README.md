# Clipboard Text Processor

浏览器插件与网页版文本处理工具

## 项目结构

```
clipboard-text-processor/
├── packages/
│   ├── core/          # 核心处理引擎
│   ├── extension/     # 浏览器插件
│   └── web/           # 网页版
├── docs/              # 文档
└── tests/             # 测试
```

## 开发

```bash
# 安装依赖
pnpm install

# 启动网页版开发服务器
pnpm dev

# 启动浏览器插件开发
pnpm dev:extension

# 构建所有包
pnpm build

# 运行测试
pnpm test
```

## 技术栈

- **核心框架**: Vue 3 + TypeScript + Vite
- **Monorepo 管理**: pnpm workspace
- **状态管理**: Pinia
- **浏览器插件**: Manifest V3
- **UI 组件库**: Naive UI

## 功能特性

- 文本清理（仅保留段落换行、删除所有换行、空格清理、CAJ 特殊字符清理、删除 Emoji、删除特殊符号、删除重复标点、删除引用角标等）
- 文本转换（全角/半角转换、标点转换、繁简转换、康熙部首替换等）
- 文本增强（中英文间添加空格、字母与数字间添加空格、标点后添加空格、段落缩进等）
- 翻译功能（多引擎翻译支持）
- 自定义规则（支持正则表达式）
- 历史记录（处理历史查看和重用）

## 许可证

MIT
