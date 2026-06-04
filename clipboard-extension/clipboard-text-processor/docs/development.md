# 开发指南

## 概述

本指南帮助开发者快速上手 Clipboard Text Processor 项目的开发，包括：
- 开发环境搭建
- 项目结构说明
- 开发流程
- 测试规范
- 部署流程

## 开发环境搭建

### 系统要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Git**: >= 2.30.0
- **VS Code**（推荐）

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/clipboard-text-processor.git
cd clipboard-text-processor
```

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 启动开发服务器

**网页版**:
```bash
pnpm --filter web dev
```

**浏览器插件**:
```bash
pnpm --filter extension dev
```

#### 4. 构建项目

**构建网页版**:
```bash
pnpm --filter web build
```

**构建浏览器插件**:
```bash
pnpm --filter extension build
```

**构建所有**:
```bash
pnpm build
```

### IDE 配置

#### VS Code

推荐安装以下扩展：

1. **Vue - Official**: Vue 3 支持
2. **TypeScript Vue Plugin (Volar)**: TypeScript 支持
3. **ESLint**: 代码检查
4. **Prettier**: 代码格式化
5. **GitLens**: Git 增强

**VS Code 配置** (`.vscode/settings.json`):
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "vue.codeActions.enabled": false
}
```

## 项目结构

### Monorepo 结构

```
clipboard-text-processor/
├── packages/
│   ├── core/                # 核心处理引擎
│   ├── extension/           # 浏览器插件
│   └── web/                 # 网页版
├── docs/                    # 文档
├── tests/                   # 测试
├── .github/                 # GitHub 配置
├── package.json             # 根 package.json
├── pnpm-workspace.yaml     # pnpm 工作空间配置
├── tsconfig.json            # TypeScript 配置
├── .eslintrc.js             # ESLint 配置
└── .prettierrc              # Prettier 配置
```

### 核心包（packages/core）

```
packages/core/
├── src/
│   ├── processors/         # 文本处理器
│   │   ├── cleanup.ts      # 清理类处理器
│   │   ├── conversion.ts   # 转换类处理器
│   │   ├── enhancement.ts  # 增强类处理器
│   │   └── translation.ts  # 翻译处理器
│   ├── rules/              # 规则引擎
│   │   ├── rule-engine.ts
│   │   ├── custom-rules.ts
│   │   └── rule-templates.ts
│   ├── config/             # 配置管理
│   │   ├── config-manager.ts
│   │   └── default-config.ts
│   ├── history/            # 历史管理
│   │   └── history-manager.ts
│   ├── types/              # 类型定义
│   │   └── index.ts
│   └── index.ts            # 入口文件
├── __tests__/              # 单元测试
├── package.json
└── tsconfig.json
```

### 浏览器插件包（packages/extension）

```
packages/extension/
├── src/
│   ├── background/         # 后台脚本
│   │   ├── background.ts
│   │   ├── clipboard-monitor.ts
│   │   └── message-handler.ts
│   ├── content/            # 内容脚本
│   │   ├── content.ts
│   │   ├── selection-handler.ts
│   │   └── context-menu.ts
│   ├── popup/              # 弹出窗口
│   │   ├── popup.ts
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── components/
│   ├── options/            # 设置页面
│   │   ├── options.ts
│   │   ├── options.html
│   │   └── pages/
│   ├── components/         # 共享组件
│   └── utils/              # 工具函数
├── public/
│   ├── icons/              # 插件图标
│   └── manifest.json       # 插件清单
├── __tests__/              # 单元测试
├── package.json
└── vite.config.ts
```

### 网页版包（packages/web）

```
packages/web/
├── src/
│   ├── views/              # 页面组件
│   │   ├── Home.vue
│   │   ├── TextProcessor.vue
│   │   ├── Settings.vue
│   │   ├── History.vue
│   │   └── CustomRules.vue
│   ├── components/         # 组件
│   │   ├── TextInput.vue
│   │   ├── TextOutput.vue
│   │   ├── ProcessorPanel.vue
│   │   ├── RuleEditor.vue
│   │   └── HistoryItem.vue
│   ├── stores/             # 状态管理
│   │   ├── processor.ts
│   │   ├── config.ts
│   │   └── history.ts
│   ├── router/             # 路由
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── __tests__/              # 单元测试
├── package.json
└── vite.config.ts
```

## 开发流程

### 1. 创建功能分支

```bash
git checkout -b feature/my-feature
```

### 2. 开发功能

#### 添加新处理器

1. 在 `packages/core/src/processors/` 目录下创建新文件
2. 实现处理器接口
3. 在 `packages/core/src/processors/index.ts` 中注册
4. 添加单元测试
5. 更新文档

#### 添加新组件

1. 在 `packages/web/src/components/` 目录下创建新组件
2. 在页面中使用组件
3. 添加单元测试
4. 更新文档

### 3. 代码检查

```bash
# 运行 ESLint
pnpm lint

# 运行 Prettier
pnpm format

# 类型检查
pnpm type-check
```

### 4. 运行测试

```bash
# 运行所有测试
pnpm test

# 运行核心包测试
pnpm --filter core test

# 运行网页版测试
pnpm --filter web test

# 运行浏览器插件测试
pnpm --filter extension test
```

### 5. 提交代码

```bash
git add .
git commit -m "feat(core): add new processor"
git push origin feature/my-feature
```

### 6. 创建 Pull Request

1. 在 GitHub 上创建 Pull Request
2. 填写 PR 描述
3. 等待 CI 检查通过
4. 请求代码审查
5. 合并到主分支

## 代码规范

### 命名规范

#### 文件命名

- **组件文件**: PascalCase（如 `TextInput.vue`）
- **工具文件**: camelCase（如 `textProcessor.ts`）
- **类型文件**: camelCase（如 `types.ts`）
- **测试文件**: 与源文件同名，添加 `.test` 后缀（如 `textProcessor.test.ts`）

#### 变量命名

- **变量和函数**: camelCase（如 `processorConfig`、`processText`）
- **类和接口**: PascalCase（如 `TextProcessor`、`ProcessingContext`）
- **常量**: UPPER_SNAKE_CASE（如 `MAX_TEXT_LENGTH`、`DEFAULT_CONFIG`）
- **私有变量**: 下划线前缀（如 `_internalState`）

#### CSS 命名

- **BEM 命名法**: `.block__element--modifier`
- **组件样式**: 使用 scoped

### 代码风格

#### TypeScript

```typescript
// ✅ 正确
interface TextProcessor {
  id: string;
  name: string;
  execute: (text: string) => string;
}

// ❌ 错误
interface textProcessor {
  id: String;
  name: String;
  execute: (text: String) => String;
}
```

#### Vue 组件

```vue
<!-- ✅ 正确 -->
<template>
  <div class="text-input">
    <input v-model="text" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');
</script>

<style scoped>
.text-input {
  padding: 16px;
}
</style>

<!-- ❌ 错误 -->
<template>
  <div>
    <input v-model="text" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: ''
    };
  }
};
</script>
```

### 注释规范

#### 函数注释

```typescript
/**
 * 处理文本
 * @param text - 要处理的文本
 * @param options - 处理选项
 * @returns 处理后的文本
 */
function processText(text: string, options?: ProcessingOptions): string {
  // 实现细节
}
```

#### 组件注释

```vue
<!--
  TextInput - 文本输入组件
  
  @example
  <TextInput v-model="text" placeholder="请输入文本" />
-->
<template>
  <!-- 模板内容 -->
</template>
```

## 测试规范

### 单元测试

#### 测试文件位置

- **核心包**: `packages/core/__tests__/`
- **网页版**: `packages/web/__tests__/`
- **浏览器插件**: `packages/extension/__tests__/`

#### 测试命名

```typescript
describe('TextProcessor', () => {
  describe('process', () => {
    it('should process text correctly', () => {
      // 测试代码
    });

    it('should handle empty text', () => {
      // 测试代码
    });

    it('should throw error for invalid input', () => {
      // 测试代码
    });
  });
});
```

#### 测试示例

```typescript
import { TextProcessorCore } from '../src';
import { deleteDuplicateNewlines } from '../src/processors/cleanup';

describe('TextProcessorCore', () => {
  let core: TextProcessorCore;

  beforeEach(() => {
    core = new TextProcessorCore();
  });

  describe('process', () => {
    it('should apply cleanup processors', () => {
      core.registerProcessor(deleteDuplicateNewlines);
      const result = core.process('Hello\n\n\nWorld');
      expect(result.text).toBe('Hello\nWorld');
    });

    it('should apply multiple processors', () => {
      core.registerProcessor(deleteDuplicateNewlines);
      core.registerProcessor(fullWidthToHalfWidth);
      const result = core.process('Ｈｅｌｌｏ\n\n\nＷｏｒｌｄ');
      expect(result.text).toBe('Hello\nWorld');
    });
  });
});
```

## 部署流程

### 网页版部署

#### 1. 构建项目

```bash
pnpm --filter web build
```

#### 2. 部署到 GitHub Pages

```bash
# 推送到 gh-pages 分支
git subtree push --prefix packages/web/dist origin gh-pages
```

#### 3. 配置 GitHub Pages

1. 进入仓库 Settings
2. 选择 Pages
3. 选择 gh-pages 分支
4. 保存

### 浏览器插件部署

#### 1. 构建插件

```bash
pnpm --filter extension build
```

#### 2. 打包插件

```bash
cd packages/extension
zip -r extension.zip dist
```

#### 3. 发布到 Chrome Web Store

1. 访问 Chrome Web Store Developer Dashboard
2. 上传 extension.zip
3. 填写插件信息
4. 提交审核

## 常见问题

### Q: 如何添加新的处理器？

A: 按照以下步骤：
1. 在 `packages/core/src/processors/` 目录下创建新文件
2. 实现 `TextProcessor` 接口
3. 在 `packages/core/src/processors/index.ts` 中注册
4. 添加单元测试
5. 更新文档

### Q: 如何调试浏览器插件？

A: 按照以下步骤：
1. 运行 `pnpm --filter extension dev`
2. 在 Chrome 中加载未打包的插件
3. 打开开发者工具
4. 在 Sources 面板中设置断点

### Q: 如何调试网页版？

A: 按照以下步骤：
1. 运行 `pnpm --filter web dev`
2. 在浏览器中打开 http://localhost:3000
3. 打开开发者工具
4. 在 Sources 面板中设置断点

### Q: 如何解决依赖冲突？

A: 按照以下步骤：
1. 删除 `node_modules` 目录
2. 删除 `pnpm-lock.yaml` 文件
3. 重新运行 `pnpm install`

### Q: 如何更新依赖？

A: 按照以下步骤：
1. 检查过期依赖：`pnpm outdated`
2. 更新依赖：`pnpm update`
3. 运行测试确保没有破坏性变更

## 最佳实践

### 1. 代码质量

- 使用 TypeScript 严格模式
- 运行 ESLint 和 Prettier
- 编写单元测试
- 保持代码简洁

### 2. 性能优化

- 使用 Web Workers 处理大量文本
- 实现缓存机制
- 优化正则表达式
- 使用懒加载

### 3. 用户体验

- 提供加载状态
- 显示错误信息
- 支持撤销操作
- 保持界面简洁

### 4. 安全性

- 验证用户输入
- 防止 XSS 攻击
- 加密敏感数据
- 最小权限原则

## 资源链接

- **Vue 3 文档**: https://vuejs.org/
- **TypeScript 文档**: https://www.typescriptlang.org/
- **Vite 文档**: https://vitejs.dev/
- **Pinia 文档**: https://pinia.vuejs.org/
- **Chrome Extension 文档**: https://developer.chrome.com/docs/extensions/
