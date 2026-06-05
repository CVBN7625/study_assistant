# 接入指南

## 概述

本指南帮助开发者快速接入 Clipboard Text Processor 项目，包括：
- 浏览器插件的安装和使用
- 网页版的访问和使用
- API 的调用方式
- 自定义处理器的开发

## 浏览器插件

### 安装

#### Chrome

1. 访问 Chrome Web Store（链接待补充）
2. 点击"添加到 Chrome"
3. 确认权限请求

#### Firefox

1. 访问 Firefox Add-ons（链接待补充）
2. 点击"添加到 Firefox"
3. 确认权限请求

#### Edge

1. 访问 Edge Add-ons（链接待补充）
2. 点击"获取"
3. 确认权限请求

### 基本使用

#### 选中文字处理

1. 在网页中选中要处理的文字
2. 右键点击，选择"处理选中文字"
3. 在弹出的菜单中选择处理方式
4. 处理完成后，文字会自动替换

#### 快捷键处理

- **Ctrl+Shift+P**（Windows/Linux）
- **Cmd+Shift+P**（Mac）

1. 选中要处理的文字
2. 按下快捷键
3. 选择处理方式
4. 处理完成

#### 剪切板处理

- **Ctrl+Shift+V**（Windows/Linux）
- **Cmd+Shift+V**（Mac）

1. 复制要处理的文字到剪切板
2. 按下快捷键
3. 选择处理方式
4. 处理完成，自动粘贴

### 高级功能

#### 自定义处理器

1. 打开插件设置页面
2. 进入"处理器"选项卡
3. 点击"添加自定义处理器"
4. 填写处理器信息：
   - 名称：处理器名称
   - 描述：处理器描述
   - 正则表达式：匹配模式
   - 替换内容：替换文本
5. 点击"保存"

#### 快捷键自定义

1. 打开插件设置页面
2. 进入"快捷键"选项卡
3. 点击要修改的快捷键
4. 按下新的快捷键组合
5. 点击"保存"

#### 配置导入/导出

1. 打开插件设置页面
2. 进入"高级"选项卡
3. 点击"导出配置"或"导入配置"
4. 选择配置文件

## 网页版

### 访问

访问地址：https://your-username.github.io/clipboard-text-processor/

### 基本使用

#### 文本处理

1. 在输入框中输入或粘贴要处理的文字
2. 在左侧面板选择处理器
3. 点击"处理"按钮
4. 在右侧查看处理结果
5. 点击"复制"或"下载"保存结果

#### 批量处理

1. 点击"批量处理"按钮
2. 上传包含多个文本的文件（支持 .txt、.csv）
3. 选择处理器
4. 点击"开始处理"
5. 下载处理结果

#### 历史记录

1. 点击"历史记录"按钮
2. 查看处理历史
3. 点击"重用"可以重新应用处理
4. 点击"删除"可以删除记录

### 高级功能

#### 自定义规则

1. 点击"自定义规则"按钮
2. 点击"添加规则"
3. 填写规则信息：
   - 名称：规则名称
   - 描述：规则描述
   - 正则表达式：匹配模式
   - 替换内容：替换文本
4. 点击"测试"验证规则
5. 点击"保存"

#### 配置同步

1. 登录账号（可选）
2. 配置会自动同步到云端
3. 在其他设备登录后，配置会自动恢复

## API 接口

### 基础信息

- **Base URL**: `https://api.clipboard-processor.com/v1`
- **认证方式**: API Key
- **请求格式**: JSON
- **响应格式**: JSON

### 认证

在请求头中添加 API Key：

```bash
Authorization: Bearer YOUR_API_KEY
```

### 接口列表

#### 1. 处理文本

**POST** `/process`

处理单个文本。

**请求参数**:
```json
{
  "text": "要处理的文本",
  "processors": ["processor-id-1", "processor-id-2"],
  "options": {
    "language": "zh",
    "customRules": [
      {
        "pattern": "正则表达式",
        "replacement": "替换内容"
      }
    ]
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "originalText": "原始文本",
    "processedText": "处理后的文本",
    "processorsUsed": ["processor-id-1", "processor-id-2"],
    "processingTime": 123
  }
}
```

#### 2. 批量处理

**POST** `/batch-process`

批量处理多个文本。

**请求参数**:
```json
{
  "texts": ["文本1", "文本2", "文本3"],
  "processors": ["processor-id-1", "processor-id-2"],
  "options": {
    "language": "zh"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "originalText": "文本1",
      "processedText": "处理后的文本1",
      "processorsUsed": ["processor-id-1", "processor-id-2"]
    },
    {
      "originalText": "文本2",
      "processedText": "处理后的文本2",
      "processorsUsed": ["processor-id-1", "processor-id-2"]
    }
  ]
}
```

#### 3. 获取处理器列表

**GET** `/processors`

获取所有可用的处理器。

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "delete-duplicate-newlines",
      "name": "仅保留段落换行",
      "description": "删除多余换行，仅保留段落结尾后的换行",
      "category": "cleanup",
      "isActive": true
    },
    {
      "id": "keep-english-word-spaces",
      "name": "仅保留英文单词间空格",
      "description": "删除非英文单词之间的空格，并将英文单词间连续空格合并为单个空格",
      "category": "cleanup",
      "isActive": true
    },
    {
      "id": "traditional-to-simplified",
      "name": "繁体转简体",
      "description": "将繁体中文转换为简体中文",
      "category": "conversion",
      "isActive": false
    }
  ]
}
```

## 自定义处理器开发

### 处理器接口

```typescript
interface TextProcessor {
  id: string;                    // 唯一标识符
  name: string;                  // 显示名称
  description: string;           // 功能描述
  category: ProcessorCategory;   // 处理器类别
  isActive: boolean;             // 是否激活
  priority: number;              // 优先级（数字越小优先级越高）
  execute: (text: string, context?: ProcessingContext) => string | Promise<string>;
}

type ProcessorCategory = 'cleanup' | 'conversion' | 'enhancement' | 'translation';

interface ProcessingContext {
  source: 'clipboard' | 'selection' | 'manual';
  language?: string;
  customRules?: CustomRule[];
}
```

### 开发步骤

#### 1. 创建处理器文件

在 `packages/core/src/processors/` 目录下创建新的处理器文件：

```typescript
// packages/core/src/processors/my-processor.ts
import { TextProcessor } from '../types';

export const myProcessor: TextProcessor = {
  id: 'my-processor',
  name: '我的处理器',
  description: '自定义处理器示例',
  category: 'cleanup',
  isActive: true,
  priority: 10,
  execute: (text: string, context?: ProcessingContext) => {
    // 在这里实现处理逻辑
    return text.replace(/some-pattern/g, 'replacement');
  }
};
```

#### 2. 注册处理器

在 `packages/core/src/processors/index.ts` 中注册处理器：

```typescript
import { myProcessor } from './my-processor';

export const processors = [
  // ... 其他处理器
  myProcessor
];
```

#### 3. 测试处理器

创建单元测试：

```typescript
// packages/core/src/processors/__tests__/my-processor.test.ts
import { myProcessor } from '../my-processor';

describe('myProcessor', () => {
  it('should process text correctly', () => {
    const input = 'input text';
    const expected = 'expected output';
    expect(myProcessor.execute(input)).toBe(expected);
  });
});
```

## 常见问题

### Q: 处理器不生效怎么办？

A: 检查以下几点：
1. 处理器是否已激活（`isActive: true`）
2. 处理器优先级是否正确
3. 正则表达式是否正确
4. 是否有其他处理器覆盖了结果

### Q: 如何调试处理器？

A: 使用以下方法：
1. 在浏览器控制台查看日志
2. 使用单元测试验证
3. 使用网页版的"测试"功能

### Q: 如何贡献处理器？

A: 按照以下步骤：
1. Fork 项目
2. 创建处理器
3. 添加测试
4. 提交 Pull Request

## 技术支持

- **GitHub Issues**: 提交问题和建议
- **文档**: 查看详细文档
- **示例**: 参考示例代码
