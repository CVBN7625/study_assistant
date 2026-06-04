# Clipboard Text Processor - 浏览器插件与网页版文本处理工具

## 一、项目概述

### 1.1 项目名称
**ClipboardTextProcessor** (剪切板文本处理器)

### 1.2 项目目标
开发一款功能强大的浏览器插件和配套网页版工具，用于处理浏览器选中文字和剪切板文字，解决从 PDF、学术论文等格式中复制文字时产生的各种格式问题。

### 1.3 核心价值
- 自动处理文本格式问题（多余空格、换行、全角字符等）
- 提供便捷的文字处理快捷方式
- 支持翻译和字符转换功能
- 提供网页版本用于设置和独立使用

### 1.4 参考项目分析

#### paper-assistant（论文工具）
**技术栈**：Vue 3 + Vite + TypeScript

**核心功能**：
- 删除引用角标：[1], [2, 3], [4-7], (1), (2, 3)
- 全角字符转半角字符
- 删除重复换行和空格
- 中英文标点转换
- 繁简转换
- 中文排版规范（pangu）

**架构特点**：
- 模块化的处理器设计（TextHandler 接口）
- 可扩展的功能配置
- 响应式 UI 组件

#### CopyPlusPlus
**技术栈**：WPF (C# + XAML)

**核心功能**：
- 系统级剪切板监控
- 自动合并 PDF 复制产生的多余换行
- 自动合并空格
- 多翻译引擎支持（百度、谷歌、DeepL）
- 翻译结果弹窗显示
- 鼠标选中文字自动处理

**架构特点**：
- 系统托盘后台运行
- 全局钩子监控鼠标和键盘事件
- 持久化用户配置

---

## 二、功能设计

### 2.1 核心功能模块

#### 2.1.1 文本处理器（TextProcessor）
基于 paper-assistant 的处理器设计，采用可扩展的插件式架构：

```typescript
interface TextHandler {
  id: string;
  name: string;
  description: string;
  category: 'cleanup' | 'conversion' | 'enhancement' | 'translation';
  isActive: boolean;
  execute: (text: string, context?: ProcessingContext) => string | Promise<string>;
}

interface ProcessingContext {
  source: 'clipboard' | 'selection';
  language?: string;
  customRules?: CustomRule[];
}
```

#### 2.1.2 清理类处理器（Cleanup）

**基础清理**：
- `deleteDuplicateNewlines` - 删除重复换行符
- `deleteDuplicateSpaces` - 删除重复空格
- `removeSpacesBetweenChinese` - 删除中文字之间的空格
- `deleteExtraWhitespace` - 删除多余空白字符

**学术文本处理**：
- `deleteReferenceBadges` - 删除引用角标（[1], (2, 3) 等）
- `deleteFootnotes` - 删除脚注标记
- `removeLineBreaksInParagraphs` - 合并段落中的换行
- `preserveParagraphBreaks` - 保留段落间换行

**格式清理**：
- `stripHtmlTags` - 删除 HTML 标签
- `removeUrls` - 删除 URL 链接
- `cleanSpecialCharacters` - 清理特殊字符

#### 2.1.3 转换类处理器（Conversion）

**字符转换**：
- `fullWidthToHalfWidth` - 全角转半角
- `halfWidthToFullWidth` - 半角转全角
- `uppercaseToLowerCase` - 大写转小写
- `lowercaseToUpperCase` - 小写转大写

**标点转换**：
- `englishToChinesePunctuation` - 英文标点转中文标点
- `chineseToEnglishPunctuation` - 中文标点转英文标点

**繁简转换**：
- `simplifiedToTraditional` - 简体转繁体
- `traditionalToSimplified` - 繁体转简体

**Unicode 处理**：
- `normalizeUnicode` - Unicode 标准化
- `correctKangxiRadicals` - 纠正康熙部首

#### 2.1.4 增强类处理器（Enhancement）

**排版优化**：
- `addSpaceBetweenChineseAndEnglish` - 在中英文之间添加空格
- `addSpaceAfterPunctuation` - 在标点后添加空格
- `panguSpacing` - 盘古之白（规范化中英文排版）

**格式化**：
- `addParagraphIndent` - 添加段落缩进
- `formatCode` - 格式化代码块
- `addNumbering` - 添加编号

#### 2.1.5 翻译功能（Translation）

**多引擎翻译**：
- 内置翻译 API 集成
- 支持百度翻译、谷歌翻译、DeepL 等
- 自动语言检测
- 翻译结果缓存

**翻译选项**：
- 翻译并替换原文
- 翻译并在下方显示
- 仅翻译选中部分

### 2.2 用户交互功能

#### 2.2.1 浏览器插件功能

**选中文字处理**：
- 右键上下文菜单："处理选中文字"
- 快捷键触发：Ctrl+Shift+P (可自定义)
- 自动检测选中文字并显示处理选项

**剪切板处理**：
- 快捷键：Ctrl+Shift+V（粘贴并处理）
- 自动处理复制到剪切板的文字
- 监听剪切板变化

**弹出界面**：
- 快速处理按钮
- 最近处理历史
- 常用规则收藏
- 快速设置入口

**通知系统**：
- 处理完成通知
- 错误提示
- 处理统计

#### 2.2.2 网页版功能

**独立处理界面**：
- 文本输入框
- 实时预览处理结果
- 一键复制处理后的文本
- 批量处理多个文本

**配置管理**：
- 处理器配置界面
- 自定义规则编辑器
- 导入/导出配置
- 配置云同步

**历史记录**：
- 处理历史查看
- 常用规则保存
- 批量操作支持

**扩展功能**：
- 文件上传处理
- URL 内容抓取
- API 接口调用

### 2.3 高级功能

#### 2.3.1 自定义规则

**正则表达式规则**：
```typescript
interface CustomRule {
  id: string;
  name: string;
  pattern: string; // 正则表达式
  replacement: string;
  flags?: string;
  isActive: boolean;
}
```

**规则模板**：
- 学术论文清理模板
- 代码格式化模板
- 日志处理模板
- 通用文本清理模板

#### 2.3.2 批量处理

- 处理多个文本段落
- 批量应用多个规则
- 导出处理结果
- 处理进度显示

#### 2.3.3 智能检测

- 自动识别文本语言
- 智能推荐处理规则
- 检测常见格式问题
- 一键优化建议

---

## 三、技术架构

### 3.1 整体架构

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

### 3.2 项目结构

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
│   ├── API.md                      # API 文档
│   ├── USER_GUIDE.md               # 用户指南
│   └── DEVELOPMENT.md              # 开发指南
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

### 3.3 技术选型

#### 3.3.1 核心框架

**构建工具**：
- **Monorepo 管理**：pnpm workspace
- **构建工具**：Vite 5.x
- **TypeScript**：5.x

**前端框架**：
- **Vue 3**：3.x（Composition API）
- **状态管理**：Pinia 2.x
- **路由**：Vue Router 4.x
- **UI 组件库**：Naive UI 或 Element Plus

**浏览器插件**：
- **Manifest V3**：最新插件标准
- **Chrome Extension API**：原生 API
- **Web Extension Polyfill**：跨浏览器兼容

#### 3.3.2 核心依赖

**文本处理**：
- `pangu`：中英文排版规范
- `opencc-js`：繁简转换
- `regexp-tree`：正则表达式处理

**翻译 API**：
- 百度翻译 API
- 谷歌翻译 API
- DeepL API

**存储**：
- `localForage`：本地存储抽象层
- `idb-keyval`：IndexedDB 简化封装

**工具库**：
- `lodash-es`：工具函数
- `date-fns`：日期处理
- `uuid`：唯一标识符生成

---

## 四、详细设计

### 4.1 核心处理引擎设计

#### 4.1.1 TextProcessorCore 接口

```typescript
interface TextProcessorCore {
  // 处理器注册
  registerProcessor(processor: TextProcessor): void;
  unregisterProcessor(processorId: string): void;

  // 处理执行
  process(text: string, options?: ProcessingOptions): ProcessingResult;
  processWithChain(text: string, processorIds: string[]): ProcessingResult;

  // 处理器查询
  getProcessor(id: string): TextProcessor | undefined;
  getProcessorsByCategory(category: ProcessorCategory): TextProcessor[];

  // 配置管理
  loadConfig(config: ProcessorConfig): void;
  exportConfig(): ProcessorConfig;

  // 历史管理
  addToHistory(entry: HistoryEntry): void;
  getHistory(limit?: number): HistoryEntry[];
  clearHistory(): void;
}
```

#### 4.1.2 处理器实现示例

```typescript
// cleanup.ts
export const cleanupProcessors: TextProcessor[] = [
  {
    id: 'delete-duplicate-newlines',
    name: '删除重复换行',
    description: '将连续的多个换行符合并为单个换行',
    category: 'cleanup',
    isActive: true,
    priority: 1,
    execute: (text: string) => {
      return text.replace(/[\r\n]+/g, '\n');
    }
  },
  {
    id: 'delete-reference-badges',
    name: '删除引用角标',
    description: '删除学术引用角标，如 [1], [2, 3], (4-7)',
    category: 'cleanup',
    isActive: true,
    priority: 2,
    execute: (text: string) => {
      text = text.replace(/\[[\d,\-\s]+]\g/, '');
      text = text.replace(/【[\d,\-\s]+】/g, '');
      text = text.replace(/\([\d,\-\s]+\)/g, '');
      return text;
    }
  },
  {
    id: 'remove-spaces-between-chinese',
    name: '删除中文字间空格',
    description: '删除中文字符之间的多余空格',
    category: 'cleanup',
    isActive: true,
    priority: 3,
    execute: (text: string) => {
      return text.replace(/([一-龥])\s+([一-龥])/g, '$1$2');
    }
  }
];
```

#### 4.1.3 规则引擎设计

```typescript
interface Rule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  replacement: string;
  flags?: string;
  isActive: boolean;
  priority: number;
}

interface RuleEngine {
  addRule(rule: Rule): void;
  removeRule(ruleId: string): void;
  updateRule(ruleId: string, updates: Partial<Rule>): void;
  applyRules(text: string, ruleIds?: string[]): string;
  validateRule(rule: Rule): ValidationResult;
}
```

### 4.2 浏览器插件设计

#### 4.2.1 权限配置（manifest.json）

```json
{
  "manifest_version": 3,
  "name": "Clipboard Text Processor",
  "version": "1.0.0",
  "description": "强大的文本处理工具，自动清理和转换剪切板文字",
  "permissions": [
    "activeTab",
    "clipboardRead",
    "clipboardWrite",
    "contextMenus",
    "storage",
    "notifications"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "options_page": "options.html",
  "commands": {
    "process-selection": {
      "suggested_key": {
        "default": "Ctrl+Shift+P",
        "mac": "Command+Shift+P"
      },
      "description": "处理选中的文字"
    },
    "process-clipboard": {
      "suggested_key": {
        "default": "Ctrl+Shift+V",
        "mac": "Command+Shift+V"
      },
      "description": "处理剪切板文字并粘贴"
    }
  }
}
```

#### 4.2.2 Background Script

```typescript
// background.ts
import { TextProcessorCore } from '@clipboard-processor/core';

const processorCore = new TextProcessorCore();

// 初始化插件
chrome.runtime.onInstalled.addListener(() => {
  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'process-selection',
    title: '处理选中文字',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'copy-and-process',
    title: '复制并处理',
    contexts: ['selection']
  });

  // 加载用户配置
  loadUserConfig();
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'process-selection') {
    processSelectedText(info.selectionText, tab);
  } else if (info.menuItemId === 'copy-and-process') {
    copyAndProcess(info.selectionText, tab);
  }
});

// 监听快捷键
chrome.commands.onCommand.addListener((command) => {
  if (command === 'process-selection') {
    processCurrentSelection();
  } else if (command === 'process-clipboard') {
    processClipboardAndPaste();
  }
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROCESS_TEXT') {
    const result = processorCore.process(message.text, message.options);
    sendResponse({ success: true, result });
  } else if (message.type === 'GET_CONFIG') {
    sendResponse({ config: processorCore.exportConfig() });
  }
  return true;
});

// 剪切板监控（可选功能）
let lastClipboardContent = '';

async function monitorClipboard() {
  const currentContent = await navigator.clipboard.readText();
  if (currentContent !== lastClipboardContent) {
    lastClipboardContent = currentContent;
    // 自动处理剪切板内容（如果启用）
    if (await isAutoProcessEnabled()) {
      const processed = processorCore.process(currentContent);
      await navigator.clipboard.writeText(processed.text);
      showNotification('已自动处理剪切板内容');
    }
  }
}

setInterval(monitorClipboard, 1000);
```

#### 4.2.3 Content Script

```typescript
// content.ts
import { SelectionHandler } from './selection-handler';

const selectionHandler = new SelectionHandler();

// 监听选中文字变化
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    selectionHandler.onSelectionChange(selection);
  }
});

// 显示处理浮动菜单
selectionHandler.onShowMenu((selectedText, position) => {
  showFloatingMenu(selectedText, position);
});

// 处理文字
async function processText(text: string, options?: ProcessingOptions) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'PROCESS_TEXT', text, options },
      (response) => {
        resolve(response.result);
      }
    );
  });
}

// 显示浮动菜单
function showFloatingMenu(text: string, position: { x: number; y: number }) {
  // 移除已存在的菜单
  const existingMenu = document.getElementById('ctp-floating-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // 创建菜单元素
  const menu = document.createElement('div');
  menu.id = 'ctp-floating-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${position.x}px;
    top: ${position.y - 10}px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 8px;
    z-index: 10000;
    display: flex;
    gap: 8px;
  `;

  // 添加菜单按钮
  const buttons = [
    { label: '清理', action: 'cleanup' },
    { label: '转换', action: 'conversion' },
    { label: '翻译', action: 'translate' },
    { label: '自定义', action: 'custom' }
  ];

  buttons.forEach(({ label, action }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      padding: 4px 12px;
      border: none;
      background: #007bff;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    btn.addEventListener('click', async () => {
      const result = await processText(text, { category: action });
      // 替换选中文字或复制到剪切板
      replaceSelectionOrCopy(result.text);
      menu.remove();
    });
    menu.appendChild(btn);
  });

  document.body.appendChild(menu);

  // 点击其他地方关闭菜单
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
    }
  }, { once: true });
}
```

#### 4.2.4 Popup 界面

```vue
<!-- popup/Popup.vue -->
<template>
  <div class="popup-container">
    <header class="popup-header">
      <h1>📋 文本处理器</h1>
      <button @click="openSettings" class="settings-btn">⚙️</button>
    </header>

    <div class="quick-actions">
      <h2>快速操作</h2>
      <div class="action-grid">
        <button
          v-for="action in quickActions"
          :key="action.id"
          @click="executeQuickAction(action)"
          class="action-btn"
        >
          <span class="action-icon">{{ action.icon }}</span>
          <span class="action-label">{{ action.label }}</span>
        </button>
      </div>
    </div>

    <div class="clipboard-section">
      <h2>剪切板处理</h2>
      <textarea
        v-model="clipboardText"
        placeholder="粘贴文字到这里处理..."
        rows="4"
      ></textarea>
      <div class="clipboard-actions">
        <button @click="pasteAndProcess" class="btn btn-primary">
          📋 粘贴并处理
        </button>
        <button @click="clearClipboard" class="btn btn-secondary">
          🗑️ 清空
        </button>
      </div>
    </div>

    <div class="result-section" v-if="processedText">
      <h2>处理结果</h2>
      <div class="result-content">
        <pre>{{ processedText }}</pre>
      </div>
      <div class="result-actions">
        <button @click="copyResult" class="btn btn-success">
          ✅ 复制结果
        </button>
        <button @click="undoProcess" class="btn btn-warning">
          ↩️ 撤销
        </button>
      </div>
    </div>

    <div class="history-section">
      <h2>最近处理</h2>
      <div class="history-list">
        <div
          v-for="item in recentHistory"
          :key="item.id"
          class="history-item"
          @click="reuseHistoryItem(item)"
        >
          <div class="history-preview">{{ item.preview }}</div>
          <div class="history-time">{{ formatTime(item.timestamp) }}</div>
        </div>
      </div>
      <button @click="viewAllHistory" class="btn btn-link">
        查看全部历史 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const clipboardText = ref('');
const processedText = ref('');
const recentHistory = ref([]);

const quickActions = [
  { id: 'clean-all', icon: '🧹', label: '一键清理' },
  { id: 'full-to-half', icon: '↔️', label: '全角转半角' },
  { id: 'remove-refs', icon: '📚', label: '删除引用' },
  { id: 'translate', icon: '🌐', label: '翻译' }
];

async function pasteAndProcess() {
  try {
    const text = await navigator.clipboard.readText();
    clipboardText.value = text;
    await processText(text);
  } catch (err) {
    console.error('读取剪切板失败:', err);
  }
}

async function processText(text: string) {
  const response = await chrome.runtime.sendMessage({
    type: 'PROCESS_TEXT',
    text,
    options: { category: 'all' }
  });

  if (response.success) {
    processedText.value = response.result.text;
    addToHistory(text, response.result.text);
  }
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(processedText.value);
    showNotification('已复制到剪切板');
  } catch (err) {
    console.error('复制失败:', err);
  }
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}
</script>

<style scoped>
.popup-container {
  width: 360px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #007bff;
}

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary { background: #007bff; color: white; }
.btn-success { background: #28a745; color: white; }
.btn-secondary { background: #6c757d; color: white; }
</style>
```

### 4.3 网页版设计

#### 4.3.1 主页面布局

```vue
<!-- views/TextProcessor.vue -->
<template>
  <div class="text-processor-page">
    <div class="processor-layout">
      <!-- 左侧输入区域 -->
      <div class="input-section">
        <div class="section-header">
          <h2>输入文本</h2>
          <div class="input-actions">
            <button @click="pasteFromClipboard" class="btn btn-outline">
              📋 从剪切板粘贴
            </button>
            <button @click="uploadFile" class="btn btn-outline">
              📁 上传文件
            </button>
            <button @click="fetchFromUrl" class="btn btn-outline">
              🔗 从 URL 抓取
            </button>
          </div>
        </div>
        <textarea
          v-model="inputText"
          placeholder="在这里输入或粘贴要处理的文字..."
          class="text-input"
        ></textarea>
        <div class="text-stats">
          <span>字符数: {{ inputText.length }}</span>
          <span>行数: {{ inputText.split('\n').length }}</span>
        </div>
      </div>

      <!-- 中间处理控制区域 -->
      <div class="control-section">
        <div class="processors-panel">
          <h3>处理器</h3>
          <div class="processor-categories">
            <div
              v-for="category in processorCategories"
              :key="category.id"
              class="category-group"
            >
              <h4 @click="toggleCategory(category.id)">
                {{ category.name }}
                <span class="toggle-icon">
                  {{ expandedCategories.includes(category.id) ? '▼' : '▶' }}
                </span>
              </h4>
              <div
                v-show="expandedCategories.includes(category.id)"
                class="processor-list"
              >
                <label
                  v-for="processor in category.processors"
                  :key="processor.id"
                  class="processor-item"
                >
                  <input
                    type="checkbox"
                    v-model="processor.isActive"
                    @change="onProcessorToggle(processor)"
                  />
                  <span class="processor-name">{{ processor.name }}</span>
                  <span
                    class="processor-info"
                    :title="processor.description"
                  >
                    ℹ️
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="processText" class="btn btn-primary btn-large">
            🚀 处理文本
          </button>
          <button @click="resetAll" class="btn btn-secondary">
            🔄 重置
          </button>
        </div>
      </div>

      <!-- 右侧输出区域 -->
      <div class="output-section">
        <div class="section-header">
          <h2>处理结果</h2>
          <div class="output-actions">
            <button @click="copyOutput" class="btn btn-success">
              ✅ 复制结果
            </button>
            <button @click="downloadOutput" class="btn btn-outline">
              💾 下载
            </button>
            <button @click="replaceInput" class="btn btn-outline">
              ↩️ 替换输入
            </button>
          </div>
        </div>
        <div class="output-content" v-if="outputText">
          <pre>{{ outputText }}</pre>
        </div>
        <div class="output-placeholder" v-else>
          <p>处理结果将在这里显示</p>
        </div>
        <div class="processing-stats" v-if="processingStats">
          <span>处理时间: {{ processingStats.time }}ms</span>
          <span>应用处理器: {{ processingStats.processorsUsed }}个</span>
        </div>
      </div>
    </div>

    <!-- 自定义规则面板 -->
    <div class="custom-rules-panel" v-if="showCustomRules">
      <CustomRulesEditor
        :rules="customRules"
        @save="saveCustomRules"
        @test="testCustomRule"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProcessorStore } from '@/stores/processor';

const processorStore = useProcessorStore();

const inputText = ref('');
const outputText = ref('');
const processingStats = ref(null);
const showCustomRules = ref(false);
const expandedCategories = ref(['cleanup']);

const processorCategories = computed(() => processorStore.categories);

async function processText() {
  if (!inputText.value.trim()) {
    alert('请先输入要处理的文字');
    return;
  }

  const startTime = performance.now();

  const result = await processorStore.process(inputText.value);

  outputText.value = result.text;
  processingStats.value = {
    time: Math.round(performance.now() - startTime),
    processorsUsed: result.processorsUsed
  };
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
  } catch (err) {
    alert('无法读取剪切板，请手动粘贴');
  }
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(outputText.value);
    alert('已复制到剪切板');
  } catch (err) {
    alert('复制失败');
  }
}
</script>
```

### 4.4 数据存储设计

#### 4.4.1 配置存储

```typescript
// config-storage.ts
interface StorageConfig {
  // 处理器配置
  processors: {
    [processorId: string]: {
      isActive: boolean;
      priority: number;
      customSettings?: Record<string, any>;
    };
  };

  // 快捷键配置
  shortcuts: {
    processSelection: string;
    processClipboard: string;
    quickClean: string;
  };

  // 翻译配置
  translation: {
    defaultEngine: 'baidu' | 'google' | 'deepl';
    apiKeys: {
      baidu?: { appId: string; secretKey: string };
      google?: { apiKey: string };
      deepl?: { apiKey: string };
    };
    defaultSourceLang: string;
    defaultTargetLang: string;
  };

  // 界面配置
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    showNotifications: boolean;
    autoProcessClipboard: boolean;
    floatingMenuEnabled: boolean;
  };
}
```

#### 4.4.2 历史记录存储

```typescript
// history-storage.ts
interface HistoryEntry {
  id: string;
  timestamp: number;
  originalText: string;
  processedText: string;
  processorsUsed: string[];
  source: 'clipboard' | 'selection' | 'manual';
  metadata?: {
    url?: string;
    pageTitle?: string;
    processingTime?: number;
  };
}

interface HistoryStorage {
  entries: HistoryEntry[];
  maxEntries: number;
  retentionDays: number;
}
```

---

## 五、开发计划

### 5.1 第一阶段：核心功能开发（2-3 周）

**Week 1：核心处理引擎**
- [ ] 搭建 Monorepo 项目结构
- [ ] 实现 TextProcessorCore 核心类
- [ ] 实现基础清理处理器（删除重复换行/空格、删除引用角标）
- [ ] 实现基础转换处理器（全角转半角、标点转换）
- [ ] 编写单元测试

**Week 2：浏览器插件基础**
- [ ] 配置 Manifest V3
- [ ] 实现 Background Script（消息处理、菜单创建）
- [ ] 实现 Content Script（选中文字检测、浮动菜单）
- [ ] 实现 Popup 界面（快速操作、剪切板处理）
- [ ] 实现基础快捷键功能

**Week 3：网页版基础**
- [ ] 搭建 Vue 3 + Vite 项目
- [ ] 实现主页面布局（输入-处理-输出）
- [ ] 实现处理器选择界面
- [ ] 实现基本的文本处理流程
- [ ] 实现配置本地存储

### 5.2 第二阶段：功能完善（2-3 周）

**Week 4：高级处理功能**
- [ ] 实现繁简转换（集成 opencc-js）
- [ ] 实现盘古之白（集成 pangu）
- [ ] 实现翻译功能（集成多个翻译 API）
- [ ] 实现自定义规则引擎
- [ ] 优化处理器性能

**Week 5：插件功能增强**
- [ ] 实现剪切板监控功能
- [ ] 实现 Options 设置页面
- [ ] 实现配置导入/导出
- [ ] 实现处理历史记录
- [ ] 添加通知提示功能

**Week 6：网页版功能增强**
- [ ] 实现文件上传处理
- [ ] 实现 URL 内容抓取
- [ ] 实现批量处理功能
- [ ] 实现历史记录管理
- [ ] 实现自定义规则编辑器

### 5.3 第三阶段：优化与发布（1-2 周）

**Week 7：测试与优化**
- [ ] 编写完整的单元测试
- [ ] 编写 E2E 测试
- [ ] 性能优化（处理速度、内存占用）
- [ ] UI/UX 优化
- [ ] 跨浏览器兼容性测试

**Week 8：发布准备**
- [ ] 编写用户文档
- [ ] 编写开发者文档
- [ ] 准备 Chrome Web Store 上架材料
- [ ] 部署网页版到 GitHub Pages
- [ ] 创建 GitHub Release

### 5.4 后续迭代功能

**V1.1（发布后 1 个月）**
- 配置云同步功能
- 更多翻译引擎支持
- 规则市场（分享和下载规则）
- 移动端适配

**V1.2（发布后 2 个月）**
- AI 辅助文本处理
- 团队协作功能
- API 开放接口
- 桌面版（Electron）

---

## 六、部署方案

### 6.1 浏览器插件发布

**Chrome Web Store**：
1. 注册 Chrome Web Store 开发者账号（$5 一次性费用）
2. 准备插件资源（图标、截图、描述）
3. 打包插件（`pnpm run build:extension`）
4. 上传到 Chrome Web Store
5. 等待审核（通常 1-3 个工作日）

**Firefox Add-ons**：
1. 注册 Firefox Add-ons 开发者账号
2. 适配 Firefox 特定 API
3. 打包并上传
4. 等待审核

**Edge Add-ons**：
1. 注册 Edge Add-ons 开发者账号
2. 复用 Chrome 插件代码
3. 打包并上传

### 6.2 网页版部署

**GitHub Pages**（推荐，免费）：
1. 构建网页版（`pnpm run build:web`）
2. 部署到 `gh-pages` 分支
3. 配置自定义域名（可选）

**Vercel / Netlify**（备选）：
1. 连接 GitHub 仓库
2. 自动部署
3. 支持自定义域名和 SSL

### 6.3 持续集成/持续部署（CI/CD）

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run test
      - run: pnpm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - uses: actions/upload-artifact@v3
        with:
          name: extension
          path: packages/extension/dist
      - uses: actions/upload-artifact@v3
        with:
          name: web
          path: packages/web/dist

  deploy-web:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: web
          path: dist
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 七、总结

### 7.1 项目亮点

1. **模块化设计**：采用插件式处理器架构，易于扩展和维护
2. **多平台支持**：浏览器插件 + 网页版，覆盖多种使用场景
3. **丰富的功能**：涵盖文本清理、转换、翻译等多种功能
4. **用户友好**：直观的界面设计，便捷的快捷键操作
5. **可扩展性**：支持自定义规则，满足个性化需求

### 7.2 技术创新

1. **统一核心引擎**：核心处理逻辑在插件和网页版之间共享
2. **智能规则推荐**：根据文本特征自动推荐处理规则
3. **实时预览**：处理过程可视化，结果即时反馈
4. **云同步**：配置和历史记录跨设备同步

### 7.3 预期成果

- **浏览器插件**：Chrome/Firefox/Edge 全平台支持
- **网页版**：响应式设计，支持桌面和移动端
- **用户量**：首年预计 10,000+ 用户
- **社区**：建立规则分享社区，促进用户互动

### 7.4 后续规划

1. **V2.0**：AI 驱动的智能文本处理
2. **V3.0**：团队协作和企业版
3. **生态建设**：开放 API，支持第三方集成

---

**项目开始时间**：2026-06-04
**预计完成时间**：2026-08-06（2 个月）
**开发团队**：1-2 人
**技术栈**：Vue 3 + TypeScript + Vite + Chrome Extension API
