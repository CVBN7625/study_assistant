/**
 * 翻译功能Vue Composable
 * 管理响应式状态、业务逻辑、localStorage持久化
 */

import { ref, reactive, computed, watch } from 'vue';
import {
  translate,
  splitText,
  getLanguageLabel,
  type LanguageCode,
  type TranslateResult
} from '../services/translation-service';

// 配置接口
export interface TranslatorConfig {
  baiduAppId: string;
  baiduSecretKey: string;
  defaultSourceLang: LanguageCode;
  defaultTargetLang: LanguageCode;
  autoTranslate: boolean;
}

// 历史记录接口
export interface TranslationHistory {
  id: string;
  timestamp: number;
  sourceText: string;
  translatedText: string;
  from: LanguageCode;
  to: LanguageCode;
}

// 存储Key
const STORAGE_KEY = 'clipboard-translator-config';
const HISTORY_KEY = 'clipboard-translator-history';
const MAX_HISTORY = 50;

/**
 * 从localStorage加载配置
 */
function loadConfig(): TranslatorConfig {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('加载翻译配置失败:', e);
    }
  }

  // 默认配置
  return {
    baiduAppId: '',
    baiduSecretKey: '',
    defaultSourceLang: 'auto',
    defaultTargetLang: 'en',
    autoTranslate: true
  };
}

/**
 * 保存配置到localStorage
 */
function saveConfig(config: TranslatorConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * 从localStorage加载历史记录
 */
function loadHistory(): TranslationHistory[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('加载翻译历史失败:', e);
    }
  }
  return [];
}

/**
 * 保存历史记录到localStorage
 */
function saveHistory(history: TranslationHistory[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * 防抖函数
 */
function useDebounceFn<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 翻译功能Composable
 */
export function useTranslator() {
  // 响应式状态
  const inputText = ref('');
  const outputText = ref('');
  const sourceLang = ref<LanguageCode>('auto');
  const targetLang = ref<LanguageCode>('en');
  const isTranslating = ref(false);
  const errorMsg = ref('');
  const translationDuration = ref(0);

  // 配置（从localStorage加载）
  const config = reactive<TranslatorConfig>(loadConfig());

  // 翻译历史
  const history = ref<TranslationHistory[]>(loadHistory());

  // 计算属性：状态消息
  const statusMessage = computed(() => {
    if (isTranslating.value) {
      return '翻译中...';
    }

    if (translationDuration.value > 0) {
      const seconds = (translationDuration.value / 1000).toFixed(1);
      return `翻译完成，耗时 ${seconds}s`;
    }

    return '等待翻译...';
  });

  // 计算属性：是否可以翻译
  const canTranslate = computed(() => {
    return (
      inputText.value.trim() &&
      config.baiduAppId &&
      config.baiduSecretKey &&
      !isTranslating.value
    );
  });

  /**
   * 执行翻译
   */
  const translateText = async () => {
    if (!canTranslate.value) {
      return;
    }

    isTranslating.value = true;
    errorMsg.value = '';
    translationDuration.value = 0;

    try {
      const text = inputText.value.trim();

      // 如果文本过长，进行拆分翻译
      if (text.length > 2000) {
        const parts = splitText(text);
        const translatedParts: string[] = [];
        let totalDuration = 0;

        for (let i = 0; i < parts.length; i++) {
          // 更新进度提示
          errorMsg.value = `翻译进度: ${i + 1}/${parts.length}`;

          const result = await translate(
            parts[i],
            sourceLang.value,
            targetLang.value,
            {
              appId: config.baiduAppId,
              secretKey: config.baiduSecretKey
            }
          );

          translatedParts.push(result.text);
          totalDuration += result.duration;
        }

        outputText.value = translatedParts.join('\n');
        translationDuration.value = totalDuration;
        errorMsg.value = '';
      } else {
        // 短文本直接翻译
        const result = await translate(
          text,
          sourceLang.value,
          targetLang.value,
          {
            appId: config.baiduAppId,
            secretKey: config.baiduSecretKey
          }
        );

        outputText.value = result.text;
        translationDuration.value = result.duration;
      }

      // 保存到历史记录
      saveToHistory(inputText.value, outputText.value);
    } catch (error: any) {
      errorMsg.value = error.message || '翻译失败';
      console.error('翻译失败:', error);
    } finally {
      isTranslating.value = false;
    }
  };

  // 防抖翻译（输入时自动触发）
  const debouncedTranslate = useDebounceFn(translateText, 500);

  /**
   * 监听输入文本变化，自动翻译
   */
  watch(
    () => inputText.value,
    (newText) => {
      if (config.autoTranslate && newText.trim() && config.baiduAppId && config.baiduSecretKey) {
        debouncedTranslate();
      }
    }
  );

  /**
   * 交换语言
   */
  const swapLanguages = () => {
    const tempLang = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tempLang;

    const tempText = inputText.value;
    inputText.value = outputText.value;
    outputText.value = tempText;
  };

  /**
   * 清空输入
   */
  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
    errorMsg.value = '';
    translationDuration.value = 0;
  };

  /**
   * 从剪贴板粘贴
   */
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
    } catch (error) {
      console.error('读取剪贴板失败:', error);
      errorMsg.value = '无法读取剪贴板内容';
    }
  };

  /**
   * 复制结果到剪贴板
   */
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(outputText.value);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      errorMsg.value = '复制失败';
      return false;
    }
  };

  /**
   * 保存到历史记录
   */
  const saveToHistory = (source: string, translated: string) => {
    const newRecord: TranslationHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      sourceText: source.slice(0, 200),
      translatedText: translated.slice(0, 200),
      from: sourceLang.value,
      to: targetLang.value
    };

    history.value.unshift(newRecord);

    // 限制历史记录数量
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY);
    }

    saveHistory(history.value);
  };

  /**
   * 重用历史记录
   */
  const reuseHistory = (item: TranslationHistory) => {
    inputText.value = item.sourceText;
    outputText.value = item.translatedText;
    sourceLang.value = item.from;
    targetLang.value = item.to;
  };

  /**
   * 删除单条历史记录
   */
  const deleteHistory = (id: string) => {
    history.value = history.value.filter(item => item.id !== id);
    saveHistory(history.value);
  };

  /**
   * 清空所有历史记录
   */
  const clearHistory = () => {
    history.value = [];
    localStorage.removeItem(HISTORY_KEY);
  };

  /**
   * 格式化时间戳
   */
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  /**
   * 更新配置
   */
  const updateConfig = (newConfig: Partial<TranslatorConfig>) => {
    Object.assign(config, newConfig);
    saveConfig(config);
  };

  /**
   * 重置配置
   */
  const resetConfig = () => {
    const defaultConfig: TranslatorConfig = {
      baiduAppId: '',
      baiduSecretKey: '',
      defaultSourceLang: 'auto',
      defaultTargetLang: 'en',
      autoTranslate: true
    };
    Object.assign(config, defaultConfig);
    saveConfig(config);
  };

  /**
   * 保存自动翻译设置
   */
  const saveAutoTranslateSetting = (value: boolean) => {
    config.autoTranslate = value;
    saveConfig(config);
  };

  return {
    // 状态
    inputText,
    outputText,
    sourceLang,
    targetLang,
    isTranslating,
    errorMsg,
    translationDuration,
    config,
    history,

    // 计算属性
    statusMessage,
    canTranslate,

    // 方法
    translateText,
    swapLanguages,
    clearInput,
    pasteFromClipboard,
    copyResult,
    reuseHistory,
    deleteHistory,
    clearHistory,
    formatTime,
    updateConfig,
    resetConfig,
    saveAutoTranslateSetting,

    // 工具函数
    getLanguageLabel
  };
}
