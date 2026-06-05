# 架构文档

## 系统架构

```
┌─────────────────────────────────────────────────────┐
│                   用户层 (User Layer)                │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ 浏览器插件   │  │ 网页版       │  │ API 接口   ││
│  │ (Extension)  │  │ (Web App)    │  │ (REST API) ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                 业务逻辑层 (Business Layer)          │
│  ┌──────────────────────────────────────────────────┐│
│  │           TextProcessorCore (核心处理引擎)       ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ ││
│  │  │ Cleanup    │  │ Conversion │  │ Translation│ ││
│  │  │ Handlers   │  │ Handlers   │  │ Engine     │ ││
│  │  └────────────┘  └────────────┘  └────────────┘ ││
│  └──────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────┐│
│  │           ConfigManager (配置管理器)             ││
│  │           HistoryManager (历史管理器)            ││
│  │           RuleEngine (规则引擎)                 ││
│  └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                 数据层 (Data Layer)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ localStorage │  │ IndexedDB    │  │ Cloud Sync ││
│  │ (配置存储)   │  │ (历史存储)   │  │ (云同步)   ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└─────────────────────────────────────────────────────┘
```

## 项目结构

```
clipboard-text-processor/
├── packages/
│   ├── core/                        # 核心处理引擎
│   │   ├── src/
│   │   │   ├── processors/         # 文本处理器
│   │   │   │   ├── cleanup.ts      # 清理类处理器
│   │   │   │   ├── conversion.ts   # 转换类处理器
│   │   │   │   ├── enhancement.ts  # 增强类处理器
│   │   │   │   └── translation.ts  # 翻译处理器
│   │   │   ├── rules/              # 规则引擎
│   │   │   │   ├── rule-engine.ts
│   │   │   │   ├── custom-rules.ts
│   │   │   │   └── rule-templates.ts
│   │   │   ├── config/             # 配置管理
│   │   │   │   ├── config-manager.ts
│   │   │   │   └── default-config.ts
│   │   │   ├── history/            # 历史管理
│   │   │   │   └── history-manager.ts
│   │   │   └── index.ts            # 入口文件
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── extension/                   # 浏览器插件
│   │   ├── src/
│   │   │   ├── background/        # 后台脚本
│   │   │   │   ├── background.ts
│   │   │   │   ├── clipboard-monitor.ts
│   │   │   │   └── message-handler.ts
│   │   │   ├── content/           # 内容脚本
│   │   │   │   ├── content.ts
│   │   │   │   ├── selection-handler.ts
│   │   │   │   └── context-menu.ts
│   │   │   ├── popup/             # 弹出窗口
│   │   │   │   ├── popup.ts
│   │   │   │   ├── popup.html
│   │   │   │   ├── popup.css
│   │   │   │   └── components/
│   │   │   │       ├── QuickActions.vue
│   │   │   │       ├── HistoryList.vue
│   │   │   │       └── Settings.vue
│   │   │   ├── options/           # 设置页面
│   │   │   │   ├── options.ts
│   │   │   │   ├── options.html
│   │   │   │   └── pages/
│   │   │   │       ├── GeneralSettings.vue
│   │   │   │       ├── ProcessorSettings.vue
│   │   │   │       ├── CustomRules.vue
│   │   │   │       └── ImportExport.vue
│   │   │   ├── components/       # 共享组件
│   │   │   └── utils/            # 工具函数
│   │   ├── public/
│   │   │   ├── icons/            # 插件图标
│   │   │   └── manifest.json     # 插件清单
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── web/                         # 网页版
│       ├── src/
│       │   ├── views/             # 页面组件
│       │   │   ├── Home.vue       # 主页
│       │   │   ├── TextProcessor.vue  # 文本处理页面
│       │   │   ├── Settings.vue   # 设置页面
│       │   │   ├── History.vue    # 历史记录页面
│       │   │   └── CustomRules.vue # 自定义规则页面
│       │   ├── components/        # 组件
│       │   │   ├── TextInput.vue
│       │   │   ├── TextOutput.vue
│       │   │   ├── ProcessorPanel.vue
│       │   │   ├── RuleEditor.vue
│       │   │   └── HistoryItem.vue
│       │   ├── stores/            # 状态管理
│       │   │   ├── processor.ts
│       │   │   ├── config.ts
│       │   │   └── history.ts
│       │   ├── router/            # 路由
│       │   │   └── index.ts
│       │   ├── App.vue
│       │   └── main.ts
│       ├── package.json
│       └── vite.config.ts
│
├── docs/                            # 文档
│   ├── architecture.md             # 架构文档（本文件）
│   ├── integration-guide.md        # 接入指南
│   └── development.md              # 开发指南
│
├── tests/                           # 测试文件
│   ├── unit/                       # 单元测试
│   └── e2e/                        # 端到端测试
│
├── .github/                         # GitHub 配置
│   └── workflows/                  # CI/CD 工作流
│
├── package.json                     # 根 package.json
├── pnpm-workspace.yaml             # pnpm 工作空间配置
├── tsconfig.json                    # TypeScript 配置
├── .eslintrc.js                     # ESLint 配置
├── .prettierrc                      # Prettier 配置
└── README.md                        # 项目说明
```

## 核心模块

### 1. TextProcessorCore（核心处理引擎）

**位置**: `packages/core/src/index.ts`

**职责**:
- 注册和管理处理器
- 执行文本处理
- 管理配置和历史

### 2. TextProcessor（处理器接口）

**位置**: `packages/core/src/processors/`

**职责**:
- 定义处理器接口
- 实现各种文本处理功能
- 支持链式调用

**内置处理器能力**:
- 清理类：仅保留段落换行、删除所有换行、删除重复空格、删除所有空格、仅保留英文单词间空格、删除引用角标、删除脚注、CAJ 特殊字符清理、删除 Emoji、删除特殊符号、删除重复标点、删除 HTML 标签、删除 URL 链接。
- 转换类：全角/半角转换、大小写转换、中英文标点转换、简体转繁体、繁体转简体、康熙部首替换。
- 增强类：中英文间添加空格、字母与数字间添加空格、标点后添加空格、添加段落缩进。
- 默认启用：仅保留段落换行、仅保留英文单词间空格、删除引用角标、删除脚注。
- 互斥规则：仅保留段落换行与删除所有换行互斥；删除所有空格、仅保留英文单词间空格、删除重复空格三者互斥。

### 3. RuleEngine（规则引擎）

**位置**: `packages/core/src/rules/`

**职责**:
- 管理自定义规则
- 应用规则到文本
- 验证规则有效性

### 4. ConfigManager（配置管理器）

**位置**: `packages/core/src/config/`

**职责**:
- 管理处理器配置
- 管理用户偏好
- 导入/导出配置

### 5. HistoryManager（历史管理器）

**位置**: `packages/core/src/history/`

**职责**:
- 记录处理历史
- 查询历史记录
- 清理过期记录

## 数据流

### 1. 文本处理流程

```
用户输入文本
    ↓
选择处理器（可选）
    ↓
调用 TextProcessorCore.process()
    ↓
遍历激活的处理器
    ↓
按优先级排序
    ↓
依次执行处理器
    ↓
返回处理结果
    ↓
显示结果 / 复制到剪切板
```

### 2. 浏览器插件数据流

```
用户选中文字 / 复制文字
    ↓
Content Script 检测到选中 / Background 监听剪切板
    ↓
发送消息到 Background Script
    ↓
Background Script 调用 TextProcessorCore
    ↓
处理完成，返回结果
    ↓
Content Script 替换选中文字 / Background 更新剪切板
    ↓
显示通知（可选）
```

### 3. 网页版数据流

```
用户在输入框输入文字
    ↓
点击"处理"按钮
    ↓
调用 TextProcessorCore.process()
    ↓
处理完成，显示结果
    ↓
用户复制结果 / 下载结果
```

## 技术选型

### 核心框架

- **Vue 3**: 渐进式 JavaScript 框架
- **TypeScript**: JavaScript 的超集，提供类型安全
- **Vite**: 下一代前端构建工具

### 状态管理

- **Pinia**: Vue 3 官方状态管理库

### 路由

- **Vue Router**: Vue 3 官方路由库

### UI 组件库

- **Naive UI**: Vue 3 组件库（推荐）
- **Element Plus**: Vue 3 组件库（备选）

### 文本处理

- **pangu**: 中英文排版规范
- **opencc-js**: 繁简转换
- **regexp-tree**: 正则表达式处理

### 翻译 API

- 百度翻译 API
- 谷歌翻译 API
- DeepL API

### 存储

- **localForage**: 本地存储抽象层
- **idb-keyval**: IndexedDB 简化封装

### 工具库

- **lodash-es**: 工具函数
- **date-fns**: 日期处理
- **uuid**: 唯一标识符生成

## 部署架构

### 浏览器插件

- **Chrome Web Store**: Chrome 插件发布
- **Firefox Add-ons**: Firefox 插件发布
- **Edge Add-ons**: Edge 插件发布

### 网页版

- **GitHub Pages**: 静态网站托管（推荐）
- **Vercel**: 部署平台（备选）
- **Netlify**: 部署平台（备选）

### CI/CD

- **GitHub Actions**: 自动化构建和部署

## 性能优化

### 1. 处理器优化

- 使用 Web Workers 处理大量文本
- 实现处理器缓存机制
- 优化正则表达式性能

### 2. 存储优化

- 使用 IndexedDB 存储大量历史记录
- 实现历史记录自动清理
- 使用 localStorage 存储配置

### 3. 网络优化

- 实现翻译结果缓存
- 使用 CDN 加速静态资源
- 实现请求重试机制

## 安全考虑

### 1. 数据安全

- 敏感数据（API 密钥）加密存储
- 不收集用户隐私数据
- 实现数据导出和删除功能

### 2. 内容安全

- 实现 CSP（内容安全策略）
- 防止 XSS 攻击
- 验证用户输入

### 3. 权限管理

- 最小权限原则
- 明确权限说明
- 用户可撤销权限

## 扩展性设计

### 1. 处理器扩展

- 支持自定义处理器
- 支持处理器插件
- 支持处理器市场

### 2. 规则扩展

- 支持自定义规则
- 支持规则模板
- 支持规则导入/导出

### 3. 翻译引擎扩展

- 支持自定义翻译引擎
- 支持翻译引擎插件
- 支持翻译引擎市场
