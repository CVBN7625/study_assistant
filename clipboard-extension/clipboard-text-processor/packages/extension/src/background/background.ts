import { TextProcessorCore, allProcessors, defaultConfig } from '@clipboard-processor/core';
import type { ProcessingOptions, ProcessorConfig, ProcessingResult } from '@clipboard-processor/core';
import {
  clearTranslationCache,
  getQuotaStateForConfig,
  resetQuotaForConfig,
  translateConfiguredText,
  translateImageFromDataUrl,
  type ImageTranslationResult,
  type TextTranslationResult
} from './baidu-translation-service';

type RuntimeMessage =
  | { type: 'PROCESS_TEXT'; text: string; options?: ProcessingOptions }
  | { type: 'TRANSLATE_TEXT'; text: string; from?: string; to?: string }
  | { type: 'TRANSLATE_IMAGE'; dataUrl: string; from?: string; to?: string }
  | { type: 'GET_CONFIG' }
  | { type: 'SAVE_CONFIG'; config: ProcessorConfig }
  | { type: 'GET_HISTORY'; limit?: number }
  | { type: 'GET_TRANSLATION_QUOTA'; apiType?: 'general' | 'large-model' | 'domain' | 'image' }
  | { type: 'RESET_TRANSLATION_QUOTA'; apiType?: 'general' | 'large-model' | 'domain' | 'image' }
  | { type: 'CLEAR_TRANSLATION_CACHE' };

const processorCore = new TextProcessorCore();
const CONFIG_STORAGE_KEY = 'processorConfig';

allProcessors.forEach(processor => {
  processorCore.registerProcessor(processor);
});

let activeConfig: ProcessorConfig = mergeConfig();
const configReady = loadStoredConfig();

chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
  console.log('Clipboard Text Processor installed');
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  void handleContextMenuClick(info, tab);
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'process-selection') {
    void processCurrentSelection();
  } else if (command === 'process-clipboard') {
    void processClipboardAndPaste();
  }
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender, sendResponse) => {
  void handleRuntimeMessage(message, sender)
    .then(response => sendResponse(response))
    .catch(error => sendResponse({ success: false, error: getErrorMessage(error) }));

  return true;
});

function createContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'process-selection',
      title: '处理选中文字',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'copy-and-process',
      title: '复制处理结果',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'translate-selection',
      title: '翻译选中文字',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'copy-translation',
      title: '复制译文',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'translate-image',
      title: '翻译图片',
      contexts: ['image']
    });
  });
}

async function handleRuntimeMessage(message: RuntimeMessage, sender: chrome.runtime.MessageSender) {
  await configReady;

  switch (message.type) {
    case 'PROCESS_TEXT': {
      const result = await processText(message.text, message.options);
      return { success: true, result };
    }
    case 'TRANSLATE_TEXT': {
      const result = await translateText(message.text, message.from, message.to);
      addHistory(message.text, result.text, ['translate-text'], 'manual', sender.tab);
      return { success: true, result };
    }
    case 'TRANSLATE_IMAGE': {
      const result = await translateImage(message.dataUrl, message.from, message.to);
      return { success: true, result };
    }
    case 'GET_CONFIG':
      return { success: true, config: await getStoredConfig() };
    case 'SAVE_CONFIG':
      await saveStoredConfig(message.config);
      return { success: true };
    case 'GET_HISTORY':
      return { success: true, history: processorCore.getHistory(message.limit) };
    case 'GET_TRANSLATION_QUOTA': {
      const config = await getStoredConfig();
      const apiType = message.apiType || config.translation.apiKeys.baidu?.apiType || 'general';
      return {
        success: true,
        quota: await getQuotaStateForConfig(apiType, config.translation)
      };
    }
    case 'RESET_TRANSLATION_QUOTA': {
      const config = await getStoredConfig();
      const apiType = message.apiType || config.translation.apiKeys.baidu?.apiType || 'general';
      await resetQuotaForConfig(apiType, config.translation);
      return { success: true };
    }
    case 'CLEAR_TRANSLATION_CACHE':
      await clearTranslationCache();
      return { success: true };
    default:
      return { success: false, error: '未知消息类型' };
  }
}

async function handleContextMenuClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab): Promise<void> {
  await configReady;

  if (info.menuItemId === 'process-selection' && info.selectionText) {
    await processSelectedText(info.selectionText, tab);
  } else if (info.menuItemId === 'copy-and-process' && info.selectionText) {
    await copyAndProcess(info.selectionText, tab);
  } else if (info.menuItemId === 'translate-selection' && info.selectionText) {
    await translateSelectedText(info.selectionText, tab, true);
  } else if (info.menuItemId === 'copy-translation' && info.selectionText) {
    await translateSelectedText(info.selectionText, tab, false);
  } else if (info.menuItemId === 'translate-image' && tab?.id && info.srcUrl) {
    await translateImageFromPage(info.srcUrl, tab);
  }
}

function mergeConfig(config?: Partial<ProcessorConfig>): ProcessorConfig {
  return {
    ...defaultConfig,
    ...config,
    processors: {
      ...defaultConfig.processors,
      ...config?.processors
    },
    shortcuts: {
      ...defaultConfig.shortcuts,
      ...config?.shortcuts
    },
    translation: {
      ...defaultConfig.translation,
      ...config?.translation,
      apiKeys: {
        ...defaultConfig.translation.apiKeys,
        ...config?.translation?.apiKeys
      }
    },
    ui: {
      ...defaultConfig.ui,
      ...config?.ui
    }
  };
}

async function getStoredConfig(): Promise<ProcessorConfig> {
  const stored = await chrome.storage.local.get(CONFIG_STORAGE_KEY);
  return mergeConfig(stored[CONFIG_STORAGE_KEY]);
}

async function saveStoredConfig(config: ProcessorConfig): Promise<void> {
  activeConfig = mergeConfig(config);
  processorCore.loadConfig(activeConfig);

  await chrome.storage.local.set({
    [CONFIG_STORAGE_KEY]: activeConfig
  });
}

async function loadStoredConfig(): Promise<void> {
  activeConfig = await getStoredConfig();
  processorCore.loadConfig(activeConfig);
}

async function processText(text: string, options?: ProcessingOptions): Promise<ProcessingResult> {
  const context = {
    source: options?.context?.source || 'manual',
    ...options?.context,
    translationConfig: activeConfig.translation,
    translateText: async (
      input: string,
      from: string,
      to: string,
      translationConfig: ProcessorConfig['translation']
    ) => (await translateConfiguredText(input, from, to, translationConfig)).text
  } satisfies ProcessingOptions['context'];

  const result = await processorCore.processAsync(text, {
    ...options,
    context
  });

  addHistory(text, result.text, result.processorsUsed, context.source);
  return result;
}

async function translateText(text: string, from?: string, to?: string): Promise<TextTranslationResult> {
  const sourceLang = from || activeConfig.translation.defaultSourceLang || 'auto';
  const targetLang = to || activeConfig.translation.defaultTargetLang || 'zh';
  return translateConfiguredText(text, sourceLang, targetLang, activeConfig.translation);
}

async function translateImage(dataUrl: string, from?: string, to?: string): Promise<ImageTranslationResult> {
  const sourceLang = from || activeConfig.translation.defaultSourceLang || 'auto';
  const targetLang = to || activeConfig.translation.defaultTargetLang || 'zh';
  return translateImageFromDataUrl(dataUrl, sourceLang, targetLang, activeConfig.translation);
}

async function processSelectedText(text: string, tab?: chrome.tabs.Tab): Promise<void> {
  const result = await processText(text, { context: { source: 'selection' } });

  if (tab?.id) {
    await sendTabMessage(tab.id, {
      type: 'REPLACE_SELECTION',
      text: result.text
    });
  }

  notify('文本处理完成', `已应用 ${result.processorsUsed.length} 个处理器`);
}

async function copyAndProcess(text: string, tab?: chrome.tabs.Tab): Promise<void> {
  const result = await processText(text, { context: { source: 'selection' } });
  await writeToClipboard(result.text, tab?.id);
  notify('已复制处理结果', '处理后的文字已复制到剪切板');
}

async function translateSelectedText(text: string, tab: chrome.tabs.Tab | undefined, replaceSelection: boolean): Promise<void> {
  try {
    const result = await translateText(text);
    addHistory(text, result.text, ['translate-text'], 'selection', tab);

    if (replaceSelection && tab?.id) {
      await sendTabMessage(tab.id, {
        type: 'REPLACE_SELECTION',
        text: result.text
      });
      notify('翻译完成', result.cached ? '已用缓存译文替换选区' : '已替换选区文字');
      return;
    }

    await writeToClipboard(result.text, tab?.id);
    notify('翻译完成', result.cached ? '缓存译文已复制到剪切板' : '译文已复制到剪切板');
  } catch (error) {
    notify('翻译失败', getErrorMessage(error));
  }
}

async function translateImageFromPage(srcUrl: string, tab: chrome.tabs.Tab): Promise<void> {
  try {
    if (!tab.id) {
      throw new Error('无法获取当前标签页');
    }

    const dataUrl = await sendTabMessage<string>(tab.id, {
      type: 'FETCH_IMAGE_AS_DATA_URL',
      srcUrl
    });

    const result = await translateImage(dataUrl);
    await writeToClipboard(result.translatedText || result.imageUrl || '', tab.id);
    notify('图片翻译完成', result.translatedText ? '识别译文已复制到剪切板' : '译图地址已复制到剪切板');
  } catch (error) {
    notify('图片翻译失败', getErrorMessage(error));
  }
}

async function processCurrentSelection(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return;
  }

  const response = await sendTabMessage<{ text: string }>(tab.id, { type: 'GET_SELECTION' });
  if (response?.text) {
    await processSelectedText(response.text, tab);
  }
}

async function processClipboardAndPaste(): Promise<void> {
  const text = await navigator.clipboard.readText();
  const result = await processText(text, { context: { source: 'clipboard' } });
  await navigator.clipboard.writeText(result.text);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await sendTabMessage(tab.id, { type: 'PASTE_TEXT', text: result.text });
  }
}

async function writeToClipboard(text: string, tabId?: number): Promise<void> {
  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (!tabId) {
      throw new Error('写入剪切板失败');
    }

    await sendTabMessage(tabId, {
      type: 'WRITE_CLIPBOARD',
      text
    });
  }
}

function addHistory(
  originalText: string,
  processedText: string,
  processorsUsed: string[],
  source: 'clipboard' | 'selection' | 'manual',
  tab?: chrome.tabs.Tab
): void {
  processorCore.addToHistory({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    originalText,
    processedText,
    processorsUsed,
    source,
    metadata: {
      url: tab?.url,
      pageTitle: tab?.title
    }
  });
}

function notify(title: string, message: string): void {
  if (!activeConfig.ui.showNotifications) {
    return;
  }

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title,
    message: message.slice(0, 180)
  });
}

function sendTabMessage<T = any>(tabId: number, message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, response => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        reject(new Error(lastError.message));
        return;
      }
      resolve(response as T);
    });
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
