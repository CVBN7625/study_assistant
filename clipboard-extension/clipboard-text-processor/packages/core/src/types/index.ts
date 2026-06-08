// 核心类型定义

// 处理器类别
export type ProcessorCategory = 'cleanup' | 'conversion' | 'enhancement' | 'translation';

// 处理上下文
export interface ProcessingContext {
  source: 'clipboard' | 'selection' | 'manual';
  language?: string;
  customRules?: CustomRule[];
  translationConfig?: ProcessorConfig['translation'];
  translateText?: (
    text: string,
    from: string,
    to: string,
    translationConfig: ProcessorConfig['translation']
  ) => Promise<string>;
}

// 自定义规则
export interface CustomRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  flags?: string;
  isActive: boolean;
}

// 文本处理器接口
export interface TextProcessor {
  id: string;
  name: string;
  description: string;
  category: ProcessorCategory;
  isActive: boolean;
  priority: number;
  execute: (text: string, context?: ProcessingContext) => string | Promise<string>;
}

// 处理选项
export interface ProcessingOptions {
  processors?: string[];
  context?: ProcessingContext;
}

// 处理结果
export interface ProcessingResult {
  text: string;
  originalText: string;
  processorsUsed: string[];
  processingTime: number;
}

// 处理器配置
export interface ProcessorConfig {
  processors: {
    [processorId: string]: {
      isActive: boolean;
      priority: number;
      customSettings?: Record<string, any>;
    };
  };
  shortcuts: {
    processSelection: string;
    processClipboard: string;
    quickClean: string;
  };
  translation: {
    defaultEngine: 'baidu' | 'google' | 'deepl';
    apiKeys: {
      baidu?: {
        appId: string;
        secretKey: string;
        apiType?: 'general' | 'large-model' | 'domain' | 'image';
        domain?: string;
        largeModelApiKey?: string;
        largeModelEndpoint?: string;
        largeModelModel?: string;
        largeModelAuthMode?: 'api-key' | 'sign';
        largeModelModelType?: 'llm' | 'nmt';
        largeModelReference?: string;
        largeModelNeedIntervene?: boolean;
        largeModelTagHandling?: boolean;
        largeModelIgnoreTags?: string;
        largeModelRequestMode?: 'baidu-translate' | 'openai-compatible';
        quotaBaseline?: number;
        imageCuid?: string;
        imageMac?: string;
        imageEndpoint?: string;
        imageQuotaBaseline?: number;
      };
      google?: { apiKey: string };
      deepl?: { apiKey: string };
    };
    defaultSourceLang: string;
    defaultTargetLang: string;
    autoTranslate?: boolean;
    cacheEnabled?: boolean;
    quotaBaseline?: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    showNotifications: boolean;
    autoProcessClipboard: boolean;
    floatingMenuEnabled: boolean;
  };
}

// 历史记录条目
export interface HistoryEntry {
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

// 核心处理引擎接口
export interface TextProcessorCoreInterface {
  registerProcessor(processor: TextProcessor): void;
  unregisterProcessor(processorId: string): void;
  process(text: string, options?: ProcessingOptions): ProcessingResult;
  processAsync(text: string, options?: ProcessingOptions): Promise<ProcessingResult>;
  processWithChain(text: string, processorIds: string[]): ProcessingResult;
  getProcessor(id: string): TextProcessor | undefined;
  getProcessorsByCategory(category: ProcessorCategory): TextProcessor[];
  loadConfig(config: ProcessorConfig): void;
  exportConfig(): ProcessorConfig;
  addToHistory(entry: HistoryEntry): void;
  getHistory(limit?: number): HistoryEntry[];
  clearHistory(): void;
}
